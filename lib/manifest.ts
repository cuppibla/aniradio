import type { EpisodePlan } from "./types";

/**
 * A bundled sample episode plan. Used as a fallback when the user runs the app
 * without GCP credentials configured — Mira's lines play via the browser's
 * SpeechSynthesis API and the music slot stays as a visual-only 30s timer.
 *
 * Real episodes are generated at runtime — see app/api/episode/plan/route.ts.
 */
export const sampleEpisode: EpisodePlan = {
  episode_id: "sample",
  title: "songs for staying up too late",
  theme: "the quiet hours",
  user_prompt: "(bundled sample — try entering your own vibe)",
  published_at: "2026-05-16",
  tracks: [
    {
      order: 0,
      type: "intro",
      mood: "intimate",
      mira_text:
        "hi. it's Mira. this is a sample episode of Late Night Vinyl — songs for staying up too late. " +
        "everything you hear was generated for this moment. okay. let's start.",
    },
    {
      order: 1,
      type: "track",
      mood: "reflective",
      mira_text:
        "the first one. a quiet acoustic piece, somewhere between Nick Drake and a memory. " +
        "fingerpicked guitar. a little tape hiss. listen to how close it sits.",
      music_prompt:
        "30-second intimate fingerpicked acoustic guitar, slow tempo, soft tape hiss, in the spirit of Nick Drake",
      track_name: "Paper Lamp",
      artist: "Mira's Imagination",
      year: 2026,
      label_palette: ["#D9A89C", "#5E3A3E"],
    },
    {
      order: 2,
      type: "track",
      mood: "quiet",
      mira_text:
        "next, something more diffuse. dream pop chords, vocals far back in the mix. " +
        "the kind of song that sounds like it's coming from another room.",
      music_prompt:
        "30-second dream pop with reverb-soaked guitars, breathy female vocals far back in the mix, mid-tempo",
      track_name: "Through the Wall",
      artist: "Mira's Imagination",
      year: 2026,
      label_palette: ["#B89FCE", "#3D2E4A"],
    },
    {
      order: 3,
      type: "track",
      mood: "intimate",
      mira_text:
        "a piano this time. a single instrument and a room. nothing else. " +
        "the spaces between notes do most of the work.",
      music_prompt:
        "30-second solo piano, slow, melancholy, sparse, with the room ambience audible",
      track_name: "Empty Room, Late",
      artist: "Mira's Imagination",
      year: 2026,
      label_palette: ["#E8C99B", "#5C4A2E"],
    },
    {
      order: 4,
      type: "outro",
      mood: "quiet",
      mira_text:
        "that's the sample. for real episodes — type a vibe and watch Mira and the music " +
        "appear from scratch. until next time... sleep well, when you can.",
    },
  ],
};
