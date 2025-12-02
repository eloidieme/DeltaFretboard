import React from "react";
import type { Settings, NoteMode, GameMode } from "../types";

interface SettingsPanelProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  onDurationChange?: (newDuration: number) => void;
  onModeChange?: (newMode: NoteMode) => void;
  onGameModeChange?: (newGameMode: GameMode) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  setSettings,
  onDurationChange,
  onModeChange,
  onGameModeChange,
}) => {
  return (
    <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-md opacity-90">
      {/* Game Mode Selector */}
      <div className="col-span-2 flex gap-2 mb-2">
        {(["single", "chords", "triads"] as GameMode[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setSettings((s) => ({ ...s, gameMode: m }));
              onGameModeChange?.(m);
            }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all 
               ${
                 settings.gameMode === m
                   ? "bg-purple-500/20 border-purple-500/40 text-purple-200 shadow-inner"
                   : "bg-transparent border-white/5 text-gray-500 hover:bg-white/5 hover:text-gray-300"
               }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Toggle Voice */}
      <div
        className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
        onClick={() =>
          setSettings((s) => ({ ...s, voiceEnabled: !s.voiceEnabled }))
        }
      >
        <span className="text-sm text-gray-300">Voice</span>
        <div
          className={`w-10 h-6 rounded-full p-1 transition-colors ${
            settings.voiceEnabled ? "bg-blue-500" : "bg-gray-600"
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
              settings.voiceEnabled ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </div>
      </div>

      {/* Toggle Tick */}
      <div
        className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
        onClick={() =>
          setSettings((s) => ({ ...s, tickEnabled: !s.tickEnabled }))
        }
      >
        <span className="text-sm text-gray-300">Tick</span>
        <div
          className={`w-10 h-6 rounded-full p-1 transition-colors ${
            settings.tickEnabled ? "bg-blue-500" : "bg-gray-600"
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
              settings.tickEnabled ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </div>
      </div>

      {/* Toggle Audio Input */}
      <div
        className="col-span-2 flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
        onClick={() =>
          setSettings((s) => ({ ...s, inputMode: !s.inputMode }))
        }
      >
        <div className="flex flex-col">
          <span className="text-sm text-gray-300">Audio Input</span>
          <span className="text-xs text-gray-500">Use microphone</span>
        </div>
        <div
          className={`w-10 h-6 rounded-full p-1 transition-colors ${
            settings.inputMode ? "bg-green-500" : "bg-gray-600"
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
              settings.inputMode ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </div>
      </div>

      {/* Toggle String Mode - Only visible in Single Mode */}
      {settings.gameMode === "single" && (
        <div
          className="col-span-2 flex items-center justify-between p-4 rounded-xl bg-white/5 border border-pink-500/30 hover:bg-pink-500/10 transition-colors cursor-pointer"
          onClick={() =>
            setSettings((s) => ({ ...s, stringMode: !s.stringMode }))
          }
        >
          <div className="flex flex-col">
            <span className="text-sm text-gray-200 font-bold">
              String Constraint
            </span>
            <span className="text-xs text-gray-400">
              Specify exact string (e.g. Low E)
            </span>
          </div>
          <div
            className={`w-10 h-6 rounded-full p-1 transition-colors ${
              settings.stringMode ? "bg-pink-500" : "bg-gray-600"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                settings.stringMode ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </div>
        </div>
      )}

      {/* Duration Slider */}
      <div className="col-span-2 p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex justify-between mb-3">
          <span className="text-sm text-gray-300">Timer</span>
          <span className="text-sm font-bold text-blue-300">
            {settings.duration}s
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="15"
          step="1"
          value={settings.duration}
          onChange={(e) => {
            const val = Number(e.target.value);
            setSettings((s) => ({ ...s, duration: val }));
            onDurationChange?.(val);
          }}
          className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>

      {/* Note Mode Selector */}
      <div className="col-span-2 flex gap-2">
        {(["mixed", "sharp", "flat"] as NoteMode[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setSettings((s) => ({ ...s, mode: m }));
              onModeChange?.(m);
            }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all 
               ${
                 settings.mode === m
                   ? "bg-white/20 border-white/40 text-white shadow-inner"
                   : "bg-transparent border-white/5 text-gray-500 hover:bg-white/5 hover:text-gray-300"
               }`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
};
