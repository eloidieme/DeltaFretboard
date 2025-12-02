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
    <div className="w-full bg-black/20 rounded-full h-3 mb-8 overflow-hidden backdrop-blur-sm border border-white/10 shadow-inner">
      <div
        className={`h-full rounded-full transition-all ease-linear shadow-[0_0_10px_rgba(0,242,255,0.5)] ${
          progressPercent < 20 
            ? "bg-gradient-to-r from-red-500 to-pink-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" 
            : "bg-gradient-to-r from-cyan-500 to-blue-500"
        }`}
        style={{
          width: `${progressPercent}%`,
          transitionDuration: isPlaying ? "100ms" : "0.5s",
        }}
      ></div>
    </div>
  );
};
