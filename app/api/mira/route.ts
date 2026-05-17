import { NextResponse } from "next/server";
import textToSpeech from "@google-cloud/text-to-speech";

export const runtime = "nodejs";
export const maxDuration = 60;

const VOICE = process.env.TTS_VOICE ?? "en-US-Chirp3-HD-Leda";
const LANGUAGE = "en-US";

let client: InstanceType<typeof textToSpeech.TextToSpeechClient> | null = null;
function getClient() {
  if (!client) {
    // fallback:true switches to the REST transport. The native gRPC client
    // doesn't bundle cleanly under Next.js / Turbopack and surfaces as
    // "undefined undefined: undefined" errors. REST has identical semantics
    // for synthesizeSpeech.
    client = new textToSpeech.TextToSpeechClient({
      projectId: process.env.GOOGLE_CLOUD_PROJECT ?? "neon-emitter-458622-e3",
      fallback: true,
    });
  }
  return client;
}

export async function POST(req: Request) {
  let body: { text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const text = (body.text ?? "").trim();
  if (!text) {
    return NextResponse.json({ error: "missing text" }, { status: 400 });
  }

  try {
    const [response] = await getClient().synthesizeSpeech({
      input: { text },
      voice: { name: VOICE, languageCode: LANGUAGE },
      audioConfig: { audioEncoding: "MP3" },
    });
    const audio = response.audioContent;
    if (!audio) {
      return NextResponse.json({ error: "no audio returned" }, { status: 500 });
    }
    const buf = Buffer.isBuffer(audio) ? audio : Buffer.from(audio as Uint8Array);
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (e: unknown) {
    console.error("[/api/mira] failed:", e);
    const message = e instanceof Error ? e.message : "tts failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
