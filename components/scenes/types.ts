export interface SceneProps {
  djSpeaking: boolean;
  showMusic: boolean;
  /** 0..1 — fraction of the current song that's played */
  musicProgress: number;
  palette: [string, string];
}
