export type SegmentType = "intro" | "track" | "outro";
export type Mood = "intimate" | "playful" | "reflective" | "quiet";

export interface BaseSegment {
  order: number;
  type: SegmentType;
  /** What Mira will say aloud. Synthesized at runtime via /api/mira. */
  mira_text: string;
  mood: Mood;
}

export interface TrackSegment extends BaseSegment {
  type: "track";
  /** Sent to Lyria. The model generates a fresh 30-second clip from this. */
  music_prompt: string;
  /** Imagined name + artist for display. Gemini invents these to match the vibe. */
  track_name: string;
  artist: string;
  year?: number;
  label_palette: [string, string];
}

export type Segment = BaseSegment | TrackSegment;

export interface EpisodePlan {
  episode_id: string;
  title: string;
  theme: string;
  user_prompt: string;
  published_at: string;
  tracks: Segment[];
}
