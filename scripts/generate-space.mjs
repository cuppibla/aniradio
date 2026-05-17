#!/usr/bin/env node
/**
 * Generate one week of audio for one aniradio space.
 *
 * For each track in spaces/<slug>/week-<YYYY-MM-DD>.json:
 *   1. Gemini 3 Flash → write Mira's intro_text in the DJ's persona
 *   2. Lyria 3 Pro    → generate the song (~2 min mp3)
 *   3. Chirp 3 HD     → synthesize the DJ's intro mp3
 *
 * Outputs to public/spaces/<slug>/<week>/:
 *   - manifest.json
 *   - 00-intro.mp3 / 00-intro.txt
 *   - 01-dj.mp3 / 01-song.mp3
 *   - 02-dj.mp3 / 02-song.mp3
 *   - ...
 *   - 13-outro.mp3 / 13-outro.txt
 *
 * Usage:
 *   node scripts/generate-space.mjs --space bedroom-pop --week 2026-05-19
 *   node scripts/generate-space.mjs --space bedroom-pop --week 2026-05-19 --limit 1
 *   node scripts/generate-space.mjs --space bedroom-pop --week 2026-05-19 --skip-music
 */

import { GoogleGenAI } from "@google/genai";
import textToSpeech from "@google-cloud/text-to-speech";
import { parseArgs } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";

const { values: args } = parseArgs({
  options: {
    space: { type: "string" },
    week: { type: "string" },
    limit: { type: "string" },
    /** Comma-separated track ids to regenerate (merge into existing manifest). */
    only: { type: "string" },
    "skip-music": { type: "boolean", default: false },
    "skip-voice": { type: "boolean", default: false },
    /** Re-synthesize Mira's voice using the dj_intro_text already in the manifest.
     * No new Gemini calls, no new Lyria calls — just Chirp with the current voice config.
     * Cheap and fast; use when you change speaking_rate / pitch and want it to take effect. */
    "resynth-voice": { type: "boolean", default: false },
  },
});

if (!args.space || !args.week) {
  console.error("usage: node scripts/generate-space.mjs --space <slug> --week <YYYY-MM-DD>");
  process.exit(1);
}

const PROJECT = process.env.GOOGLE_CLOUD_PROJECT ?? "neon-emitter-458622-e3";
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION ?? "global";
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3-flash-preview";
const LYRIA_MODEL = process.env.LYRIA_MODEL ?? "lyria-3-pro-preview";

const inputPath = path.resolve(`spaces/${args.space}/week-${args.week}.json`);
const outputDir = path.resolve(`public/spaces/${args.space}/${args.week}`);

const ai = new GoogleGenAI({ vertexai: true, project: PROJECT, location: LOCATION });
const tts = new textToSpeech.TextToSpeechClient({
  projectId: PROJECT,
  fallback: true,
});

const week = JSON.parse(await fs.readFile(inputPath, "utf8"));
await fs.mkdir(outputDir, { recursive: true });

const onlyIds = args.only
  ? args.only.split(",").map((s) => s.trim()).filter(Boolean)
  : null;

const limit = args.limit ? parseInt(args.limit, 10) : week.tracks.length;
const tracks = onlyIds
  ? week.tracks.filter((t) => onlyIds.includes(t.id))
  : week.tracks.slice(0, limit);

if (onlyIds && tracks.length !== onlyIds.length) {
  console.error(`warning: requested ${onlyIds.length} ids, found ${tracks.length}`);
}

const MIRA_SYSTEM = `\
You are ${week.dj.name}, the DJ of the aniradio room "${week.title}".

PERSONA
${week.dj.persona}

VOICE RULES (apply to every line you write)
- Lowercase. Like she's speaking, not reading.
- Short sentences, sometimes fragments.
- Comfortable with pauses (use "...").
- No exclamations.
- Never use "up next", "stay tuned", "you're listening to".
- Never pretend to have a body or human memories.
- Never use hype words ("amazing", "incredible").

WHAT TO SAY ABOUT EACH TRACK
- Pick ONE specific, true thing about the sound — a texture, an instrument detail, a feeling. Concrete, not generic.
- Use the DJ HINT if the editor gave one — it's the angle they want.
- Vary your angle across tracks. Don't repeat the same observation shape.
- 15–25 seconds spoken. About 40–70 words.
- It's okay to occasionally just introduce a track softly with no fact at all.

INTRO segment (~30 seconds spoken, ~80 words)
- Name the show title and a hint of the theme.
- Set the mood.
- End with something like "okay. let's start."

OUTRO segment (~20 seconds spoken, ~50 words)
- Brief, warm goodbye.
- Mention you'll be back next monday.
`;

// ---- helpers ----------------------------------------------------------------

async function geminiScript(userPrompt) {
  const resp = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: userPrompt,
    config: {
      systemInstruction: MIRA_SYSTEM,
      temperature: 0.85,
    },
  });
  return (resp.text ?? "").trim();
}

async function chirpSpeak(text, outPath) {
  const [response] = await tts.synthesizeSpeech({
    input: { text },
    voice: { name: week.dj.voice, languageCode: "en-US" },
    audioConfig: {
      audioEncoding: "MP3",
      // Softer, more contemplative delivery via slower pace. Chirp 3 HD voices
      // don't support pitch — only speakingRate is honored.
      speakingRate: week.dj.speaking_rate ?? 0.9,
    },
  });
  const buf = Buffer.from(response.audioContent);
  await fs.writeFile(outPath, buf);
  return buf.length;
}

async function lyriaSong(prompt, outPath) {
  const response = await ai.models.generateContent({
    model: LYRIA_MODEL,
    contents: prompt,
    config: { responseModalities: ["AUDIO", "TEXT"] },
  });
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const audioPart = parts.find((p) => p.inlineData?.data);
  if (!audioPart) {
    const summary = parts.map((p) => ({ hasText: !!p.text, textPreview: p.text?.slice(0, 80) }));
    throw new Error(`Lyria returned no audio. parts: ${JSON.stringify(summary)}`);
  }
  const buf = Buffer.from(audioPart.inlineData.data, "base64");
  await fs.writeFile(outPath, buf);
  return buf.length;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

// ---- per-track work --------------------------------------------------------

async function workIntro() {
  console.log(`→ [00] intro · script…`);
  const text = await geminiScript(
    `Write the intro for tonight's show.

SHOW TITLE: ${week.title}
THEME: ${week.theme}
EDITOR HINT: ${week.intro_hint}

Return ONLY the spoken text. No JSON, no quotes, no formatting. Just what Mira says.`
  );
  await fs.writeFile(path.join(outputDir, "00-intro.txt"), text);

  if (args["skip-voice"]) {
    console.log(`  [00] intro · voice skipped`);
    return { text };
  }
  console.log(`  [00] intro · synth…`);
  const bytes = await chirpSpeak(text, path.join(outputDir, "00-intro.mp3"));
  console.log(`  [00] intro · ${bytes} bytes`);
  return { text };
}

async function workOutro(order) {
  console.log(`→ [${pad2(order)}] outro · script…`);
  const text = await geminiScript(
    `Write the outro for tonight's show.

SHOW TITLE: ${week.title}
THEME: ${week.theme}
EDITOR HINT: ${week.outro_hint}

Return ONLY the spoken text. No JSON, no quotes, no formatting.`
  );
  await fs.writeFile(path.join(outputDir, `${pad2(order)}-outro.txt`), text);

  if (args["skip-voice"]) return { text };
  console.log(`  [${pad2(order)}] outro · synth…`);
  const bytes = await chirpSpeak(text, path.join(outputDir, `${pad2(order)}-outro.mp3`));
  console.log(`  [${pad2(order)}] outro · ${bytes} bytes`);
  return { text };
}

async function workTrack(track, order) {
  const prefix = `[${pad2(order)}] ${track.track_name}`;
  console.log(`→ ${prefix} · script…`);

  const text = await geminiScript(
    `Write Mira's intro for this track.

TRACK
- Title: "${track.track_name}"
- Artist: ${track.artist}
- Year: ${track.year ?? "?"}
${track.dj_hint ? `- Editor hint (angle to take): ${track.dj_hint}` : ""}

Return ONLY the spoken text. No JSON, no quotes, no formatting. 15–25 seconds spoken.`
  );
  await fs.writeFile(path.join(outputDir, `${pad2(order)}-dj.txt`), text);

  let voiceOk = false;
  let musicOk = false;

  if (!args["skip-voice"]) {
    try {
      const b = await chirpSpeak(text, path.join(outputDir, `${pad2(order)}-dj.mp3`));
      console.log(`  ${prefix} · dj voice · ${b} bytes`);
      voiceOk = true;
    } catch (e) {
      console.error(`  ${prefix} · dj voice FAILED · ${e.message}`);
    }
  }

  if (!args["skip-music"]) {
    try {
      const b = await lyriaSong(track.music_prompt, path.join(outputDir, `${pad2(order)}-song.mp3`));
      console.log(`  ${prefix} · lyria song · ${b} bytes`);
      musicOk = true;
    } catch (e) {
      console.error(`  ${prefix} · lyria song FAILED · ${e.message}`);
    }
  }

  return { ...track, dj_intro_text: text, _voiceOk: voiceOk, _musicOk: musicOk };
}

// ---- run ------------------------------------------------------------------

const startedAt = Date.now();
console.log(`Generating "${week.title}" (${args.space} · ${args.week})`);
if (onlyIds) {
  console.log(`Mode: --only ${onlyIds.join(",")} (merge into existing manifest)`);
}
console.log(`Tracks: ${tracks.length}${args.limit && !onlyIds ? ` (limited from ${week.tracks.length})` : ""}`);
console.log(`Output: ${path.relative(process.cwd(), outputDir)}`);
console.log();

// --resynth-voice: re-run Chirp on every segment's existing dj_intro_text
// using the current voice config (speaking_rate, pitch). No Gemini, no Lyria.
if (args["resynth-voice"]) {
  const manifestPath = path.join(outputDir, "manifest.json");
  const existing = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  console.log(
    `→ re-synthesizing ${existing.segments.length} voice clips with rate=${week.dj.speaking_rate ?? 0.9} pitch=${week.dj.pitch ?? -1.0}`
  );
  await Promise.all(
    existing.segments.map(async (seg) => {
      if (!seg.dj_intro_text || !seg.dj_intro_url) return;
      const filename = path.basename(seg.dj_intro_url);
      const out = path.join(outputDir, filename);
      try {
        const bytes = await chirpSpeak(seg.dj_intro_text, out);
        console.log(`  [${pad2(seg.order)}] ${filename} · ${bytes} bytes`);
      } catch (e) {
        console.error(`  [${pad2(seg.order)}] ${filename} FAILED · ${e.message}`);
      }
    })
  );
  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log(`\n✓ Resynth done in ${elapsed}s`);
  process.exit(0);
}

// In --only mode, regenerate only the listed tracks and merge into the
// existing manifest. Otherwise do a full run including intro/outro.
if (onlyIds) {
  const manifestPath = path.join(outputDir, "manifest.json");
  let existing;
  try {
    existing = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  } catch {
    console.error(`No existing manifest at ${manifestPath} — run a full pass first.`);
    process.exit(1);
  }

  // index incoming tracks by their order position in the week file
  const orderFor = new Map();
  for (let i = 0; i < week.tracks.length; i++) {
    orderFor.set(week.tracks[i].id, i + 1);
  }

  const results = await Promise.all(
    tracks.map((t) => workTrack(t, orderFor.get(t.id)))
  );

  // merge: replace each regenerated track's entry in the existing manifest
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const order = orderFor.get(tracks[i].id);
    const segIdx = existing.segments.findIndex((s) => s.order === order && s.type === "track");
    if (segIdx === -1) continue;
    existing.segments[segIdx] = {
      ...existing.segments[segIdx],
      track_name: r.track_name,
      artist: r.artist,
      year: r.year,
      dj_intro_text: r.dj_intro_text,
      dj_intro_url: r._voiceOk
        ? `/spaces/${args.space}/${args.week}/${pad2(order)}-dj.mp3`
        : existing.segments[segIdx].dj_intro_url,
      music_url: r._musicOk
        ? `/spaces/${args.space}/${args.week}/${pad2(order)}-song.mp3`
        : existing.segments[segIdx].music_url,
    };
  }

  await fs.writeFile(manifestPath, JSON.stringify(existing, null, 2));
  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log();
  console.log(`✓ Merged ${results.length} track(s) in ${elapsed}s`);
  console.log(`  Manifest: ${path.relative(process.cwd(), manifestPath)}`);
  process.exit(0);
}

const introResult = await workIntro();

// run the 12 tracks in parallel — Lyria + Chirp can handle it,
// and total wall time is bounded by the slowest single Lyria call.
const trackResults = await Promise.all(
  tracks.map((t, i) => workTrack(t, i + 1))
);

const outroOrder = tracks.length + 1;
const outroResult = await workOutro(outroOrder);

// build the manifest the frontend consumes
const manifest = {
  slug: week.slug,
  week_of: week.week_of,
  title: week.title,
  theme: week.theme,
  dj: week.dj,
  palette: week.palette,
  segments: [
    {
      order: 0,
      type: "intro",
      dj_intro_text: introResult.text,
      dj_intro_url: `/spaces/${args.space}/${args.week}/00-intro.mp3`,
    },
    ...trackResults.map((t, i) => ({
      order: i + 1,
      type: "track",
      track_name: t.track_name,
      artist: t.artist,
      year: t.year,
      dj_intro_text: t.dj_intro_text,
      dj_intro_url: t._voiceOk ? `/spaces/${args.space}/${args.week}/${pad2(i + 1)}-dj.mp3` : null,
      music_url: t._musicOk ? `/spaces/${args.space}/${args.week}/${pad2(i + 1)}-song.mp3` : null,
    })),
    {
      order: outroOrder,
      type: "outro",
      dj_intro_text: outroResult.text,
      dj_intro_url: `/spaces/${args.space}/${args.week}/${pad2(outroOrder)}-outro.mp3`,
    },
  ],
};

await fs.writeFile(
  path.join(outputDir, "manifest.json"),
  JSON.stringify(manifest, null, 2)
);

const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
console.log();
console.log(`✓ Done in ${elapsed}s`);
console.log(`  Manifest: ${path.relative(process.cwd(), path.join(outputDir, "manifest.json"))}`);
console.log(`  Listen:   http://localhost:3000/spaces/${args.space}`);
