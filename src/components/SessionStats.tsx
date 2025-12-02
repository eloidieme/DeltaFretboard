import React from "react";

interface SessionStatsProps {
  duration: number;
}

export const SessionStats: React.FC<SessionStatsProps> = ({ duration }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-xs font-mono tracking-widest text-blue-200 opacity-70 hover:opacity-100 transition-opacity">
      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
      SESSION: {formatTime(duration)}
    </div>
  );
};
