import React from "react";

interface StatusIndicatorProps {
  isPlaying: boolean;
  onToggle: () => void;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  isPlaying,
  onToggle,
}) => {
  return (
    <div className="absolute top-4 right-4 cursor-pointer" onClick={onToggle}>
      {isPlaying ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-green-300 font-bold uppercase tracking-wider">
            Live
          </span>
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-xs text-red-400 font-bold uppercase tracking-wider">
            Paused
          </span>
          <div className="h-3 w-3 rounded-full bg-red-500/50"></div>
        </div>
      )}
    </div>
  );
};
