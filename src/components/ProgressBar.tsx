import React from "react";

interface ProgressBarProps {
  timeLeft: number;
  totalTime: number;
  isPlaying: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  timeLeft,
  totalTime,
  isPlaying,
}) => {
  const progressPercent = (timeLeft / totalTime) * 100;

  return (
    <div className="w-full bg-gray-700/50 rounded-full h-3 mb-8 overflow-hidden backdrop-blur-sm border border-white/5">
      <div
        className={`h-full rounded-full transition-all ease-linear ${
          progressPercent < 20 ? "bg-red-500" : "bg-blue-500"
        }`}
        style={{
          width: `${progressPercent}%`,
          transitionDuration: isPlaying ? "100ms" : "0.5s",
        }}
      ></div>
    </div>
  );
};
