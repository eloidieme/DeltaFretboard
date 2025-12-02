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
      className={`w-full py-4 text-lg font-semibold tracking-wide text-white transition-all transform rounded-xl hover:scale-[1.02] active:scale-95 shadow-lg
        ${
          isPlaying
            ? "bg-gradient-to-r from-red-500 to-pink-600 hover:shadow-red-500/20"
            : "bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-blue-500/20"
        }`}
    >
      {isPlaying ? "Stop (Space)" : "Start Training"}
    </button>
  );
};
