import { useEffect } from "react";
import { useGameLogic } from "./hooks/useGameLogic";
import { StatusIndicator } from "./components/StatusIndicator";
import { DisplayArea } from "./components/DisplayArea";
import { ProgressBar } from "./components/ProgressBar";
import { ControlButtons } from "./components/ControlButtons";
import { SettingsPanel } from "./components/SettingsPanel";

function App() {
  const {
    currentNote,
    currentString,
    timeLeft,
    isPlaying,
    settings,
    setSettings,
    togglePlay,
  } = useGameLogic();

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 select-none bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      <h1 className="text-3xl font-light tracking-widest text-white/80 mb-8 uppercase">
        Delta<span className="font-bold text-white">Fretboard</span>
      </h1>

      <div className="relative w-full max-w-md p-8 rounded-3xl border border-white/20 shadow-2xl backdrop-blur-xl bg-white/10 transition-all duration-300">
        <StatusIndicator isPlaying={isPlaying} onToggle={togglePlay} />
        
        <DisplayArea 
          currentNote={currentNote} 
          currentString={currentString} 
          gameMode={settings.gameMode}
        />
        
        <ProgressBar 
          timeLeft={timeLeft} 
          totalTime={settings.duration * 10} 
          isPlaying={isPlaying} 
        />
        
        <ControlButtons isPlaying={isPlaying} onToggle={togglePlay} />
      </div>

      <SettingsPanel settings={settings} setSettings={setSettings} />
    </div>
  );
}

export default App;
