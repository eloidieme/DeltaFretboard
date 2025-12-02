import { useEffect, useState } from "react";
import { useGameLogic } from "./hooks/useGameLogic";
import { StatusIndicator } from "./components/StatusIndicator";
import { DisplayArea } from "./components/DisplayArea";
import { ProgressBar } from "./components/ProgressBar";
import { ControlButtons } from "./components/ControlButtons";
import { SettingsPanel } from "./components/SettingsPanel";
import { SessionStats } from "./components/SessionStats";

function App() {
  const {
    currentNote,
    currentString,
    timeLeft,
    isPlaying,
    settings,
    setSettings,
    togglePlay,
    sessionDuration,
  } = useGameLogic();

  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 select-none relative overflow-hidden">
      <SessionStats duration={sessionDuration} />
      
      <button 
        onClick={toggleFullscreen}
        className="absolute top-4 left-4 p-2 rounded-full glass-panel text-gray-400 hover:text-white transition-colors opacity-50 hover:opacity-100"
        title="Toggle Fullscreen"
      >
        {isFullscreen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
        )}
      </button>

      <h1 className="text-5xl font-light tracking-widest mb-12 uppercase text-glow">
        Delta<span className="font-bold neon-cyan">Fretboard</span>
      </h1>

      <div className="relative w-full max-w-md p-8 rounded-3xl glass-panel transition-all duration-300">
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
