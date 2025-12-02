import React from "react";

interface ControlButtonsProps {
  isPlaying: boolean;
  onToggle: () => void;
}

export const ControlButtons: React.FC<ControlButtonsProps> = ({
  isPlaying,
  onToggle,
}) => {
  return (
    <button
      onClick={onToggle}
      className={`w-full py-4 text-lg font-semibold tracking-wide text-white transition-all transform rounded-xl glass-button
        ${
          isPlaying
            ? "border-red-500/30 hover:border-red-500/60 text-red-100"
            : "border-cyan-500/30 hover:border-cyan-500/60 text-cyan-100"
        }`}
    >
      <span className={isPlaying ? "text-red-300 text-glow" : "neon-cyan"}>
        {isPlaying ? "Stop (Space)" : "Start Training"}
      </span>
    </button>
  );
};
