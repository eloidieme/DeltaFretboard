export type NoteMode = "sharp" | "flat" | "mixed";
export type GameMode = "single" | "chords" | "triads";

export interface Settings {
  duration: number;
  mode: NoteMode;
  gameMode: GameMode;
  voiceEnabled: boolean;
  tickEnabled: boolean;
  stringMode: boolean;
  inputMode: boolean;
}
