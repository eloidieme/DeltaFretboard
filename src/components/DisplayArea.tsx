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
      <span className="text-sm font-medium tracking-widest text-blue-200 uppercase mb-2">
        {label}
      </span>

      {/* THE NOTE */}
      <div
        className={`${fontSizeClass} font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-300 drop-shadow-lg leading-none pb-4 text-center px-4 transition-all duration-300`}
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
            <span className="text-xs text-pink-200 uppercase tracking-widest mb-1">
              On String
            </span>
            <span className="text-3xl font-bold text-pink-400 drop-shadow-md border px-4 py-1 rounded-lg border-pink-500/30 bg-pink-500/10">
              {currentString}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
