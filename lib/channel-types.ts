export type SegmentType = "intro" | "track" | "outro";

export interface IntroOutroSegment {
  order: number;
  type: "intro" | "outro";
  dj_intro_text: string;
  dj_intro_url: string | null;
}

export interface TrackSegment {
  order: number;
  type: "track";
  track_name: string;
  artist: string;
  year?: number;
  dj_intro_text: string;
  dj_intro_url: string | null;
  music_url: string | null;
}

export type Segment = IntroOutroSegment | TrackSegment;

export interface SpaceManifest {
  slug: string;
  week_of: string;
  title: string;
  theme: string;
  dj: { name: string; voice: string; persona?: string };
  palette: [string, string];
  segments: Segment[];
}
