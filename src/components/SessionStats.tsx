import React from "react";
import type { SessionMode } from "../types";

interface SessionStatsProps {
  duration: number;
  sessionMode: SessionMode;
  fixedCount: number;
  fixedTimeMinutes: number;
  completedAttempts: number;
  isPlaying: boolean;
}

export const SessionStats: React.FC<SessionStatsProps> = ({
  duration,
  sessionMode,
  fixedCount,
  fixedTimeMinutes,
  completedAttempts,
  isPlaying,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const progress =
    sessionMode === "fixed-count"
      ? `${completedAttempts} / ${fixedCount}`
      : sessionMode === "fixed-time"
        ? `${formatTime(duration)} / ${formatTime(fixedTimeMinutes * 60)}`
        : formatTime(duration);

  return (
    <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-xs font-mono tracking-widest text-blue-200 opacity-70 hover:opacity-100 transition-opacity">
      <span
        className={`w-2 h-2 rounded-full bg-blue-500 ${
          isPlaying ? "animate-pulse" : "opacity-40"
        }`}
      />
      SESSION: {progress}
    </div>
  );
};
