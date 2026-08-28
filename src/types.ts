export type NoteMode = "sharp" | "flat" | "mixed";
export type GameMode = "single" | "chords" | "triads";
export type SessionMode = "free" | "fixed-count" | "fixed-time";
export type AttemptResult = "pending" | "correct" | "timeout" | "stopped";

export interface TimelinePlayedNote {
  note: string;
  atMs: number;
  correct: boolean;
}

export interface TimelineAttempt {
  id: number;
  startedAtMs: number;
  target: string;
  targetString: string | null;
  playedNotes: TimelinePlayedNote[];
  result: AttemptResult;
  reactionTimeMs?: number;
}

export interface TrainingStats {
  reactionTimes: number[];
  totalAttempts: number;
  noteStats: Record<
    string,
    { correct: number; mistakes: number; totalTime: number }
  >;
  timeline: TimelineAttempt[];
}

export interface Settings {
  duration: number;
  mode: NoteMode;
  gameMode: GameMode;
  sessionMode: SessionMode;
  fixedCount: number;
  fixedTimeMinutes: number;
  voiceEnabled: boolean;
  tickEnabled: boolean;
  stringMode: boolean;
  inputMode: boolean;
}
