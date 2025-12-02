import React from "react";
import type { GameMode } from "../types";

interface DisplayAreaProps {
  currentNote: string;
  currentString: string | null;
  gameMode: GameMode;
}

export const DisplayArea: React.FC<DisplayAreaProps> = ({
  currentNote,
  currentString,
  gameMode,
}) => {
  // Dynamic Label
  const label =
    gameMode === "chords"
      ? "Target Chord"
      : gameMode === "triads"
      ? "Target Triad"
      : "Target Note";

  // Dynamic Font Size
  // Base size on mode and content length
  let fontSizeClass = "text-9xl";
  if (gameMode === "chords") {
    fontSizeClass = "text-6xl";
  } else if (gameMode === "triads") {
    fontSizeClass = "text-4xl";
    if (currentNote.length > 20) fontSizeClass = "text-3xl";
  }

  return (
    <div className="flex flex-col items-center justify-center py-6 min-h-[240px]">
      <span className="text-sm font-medium tracking-widest text-blue-300 uppercase mb-2 text-glow">
        {label}
      </span>

      {/* THE NOTE */}
      <div
        className={`${fontSizeClass} font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-200 drop-shadow-[0_0_15px_rgba(0,242,255,0.5)] leading-none pb-4 text-center px-4 transition-all duration-300`}
      >
        {currentNote}
      </div>

      {/* THE STRING (Conditional Render) */}
      <div
        className={`transition-all duration-500 ease-out transform ${
          currentString
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4"
        }`}
      >
        {currentString && (
          <div className="flex flex-col items-center animate-pulse-slow">
            <span className="text-xs text-purple-300 uppercase tracking-widest mb-1 text-glow">
              On String
            </span>
            <span className="text-3xl font-bold text-white drop-shadow-[0_0_10px_rgba(189,0,255,0.8)] border px-6 py-2 rounded-xl border-purple-500/30 bg-purple-500/10 backdrop-blur-md shadow-[0_0_20px_rgba(189,0,255,0.2)]">
              {currentString}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
