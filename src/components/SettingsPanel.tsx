import React from "react";
import type { Settings, NoteMode, GameMode, SessionMode } from "../types";

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
              setSettings((s) => ({ 
                ...s, 
                gameMode: m,
                // Disable input mode if switching to chords/triads
                inputMode: m === "single" ? s.inputMode : false 
              }));
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

      {/* Session Mode Selector */}
      <div className="col-span-2 p-4 rounded-xl bg-white/5 border border-white/10">
        <span className="block text-sm text-gray-300 mb-3">Session Mode</span>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ["free", "Free"],
              ["fixed-count", "Fixed Number"],
              ["fixed-time", "Fixed Time"],
            ] as [SessionMode, string][]
          ).map(([mode, label]) => (
            <button
              key={mode}
              onClick={() =>
                setSettings((s) => ({ ...s, sessionMode: mode }))
              }
              className={`py-3 px-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${
                settings.sessionMode === mode
                  ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-100"
                  : "bg-transparent border-white/5 text-gray-500 hover:bg-white/5 hover:text-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {settings.sessionMode === "fixed-count" && (
          <label className="flex items-center justify-between gap-4 mt-4 text-sm text-gray-300">
            <span>Number of prompts</span>
            <input
              type="number"
              min="1"
              max="200"
              value={settings.fixedCount}
              onChange={(event) =>
                setSettings((s) => ({
                  ...s,
                  fixedCount: Math.min(
                    200,
                    Math.max(1, Number(event.target.value) || 1)
                  ),
                }))
              }
              className="w-24 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-right text-white outline-none focus:border-cyan-500/50"
            />
          </label>
        )}

        {settings.sessionMode === "fixed-time" && (
          <label className="flex items-center justify-between gap-4 mt-4 text-sm text-gray-300">
            <span>Session duration</span>
            <span className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="120"
                value={settings.fixedTimeMinutes}
                onChange={(event) =>
                  setSettings((s) => ({
                    ...s,
                    fixedTimeMinutes: Math.min(
                      120,
                      Math.max(1, Number(event.target.value) || 1)
                    ),
                  }))
                }
                className="w-24 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-right text-white outline-none focus:border-cyan-500/50"
              />
              <span className="text-xs text-gray-500">min</span>
            </span>
          </label>
        )}
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
        className={`col-span-2 flex items-center justify-between p-4 rounded-xl border transition-colors ${
          settings.gameMode === "single"
            ? "bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer"
            : "bg-white/5 border-white/5 opacity-50 cursor-not-allowed"
        }`}
        onClick={() => {
          if (settings.gameMode === "single") {
            setSettings((s) => ({ ...s, inputMode: !s.inputMode }));
          }
        }}
      >
        <div className="flex flex-col">
          <span className="text-sm text-gray-300">Audio Input</span>
          <span className="text-xs text-gray-500">
            {settings.gameMode === "single"
              ? "Use microphone"
              : "Not available for chords"}
          </span>
        </div>
        <div
          className={`w-10 h-6 rounded-full p-1 transition-colors ${
            settings.inputMode && settings.gameMode === "single"
              ? "bg-green-500"
              : "bg-gray-600"
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
              settings.inputMode && settings.gameMode === "single"
                ? "translate-x-4"
                : "translate-x-0"
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
          <span className="text-sm text-gray-300">Prompt Timer</span>
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
