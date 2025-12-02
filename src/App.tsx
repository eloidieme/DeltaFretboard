import { useEffect, useState } from "react";
import { useGameLogic } from "./hooks/useGameLogic";
import { StatusIndicator } from "./components/StatusIndicator";
import { DisplayArea } from "./components/DisplayArea";
import { ProgressBar } from "./components/ProgressBar";
import { ControlButtons } from "./components/ControlButtons";
import { SettingsPanel } from "./components/SettingsPanel";
import { SessionStats } from "./components/SessionStats";
import { AudioStatsPanel } from "./components/AudioStatsPanel";

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
    detectedNote,
    stats,
  } = useGameLogic();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showStats, setShowStats] = useState(true);

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

      <div className="relative w-full max-w-6xl flex justify-center">
        <div className="flex flex-col items-center gap-8 w-full max-w-md relative z-10">
          <div className="relative w-full p-8 rounded-3xl glass-panel transition-all duration-300">
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

            {settings.inputMode && (
              <div className="mt-6 text-center animate-fade-in relative group">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">Input</span>
                  <button 
                    onClick={() => setShowStats(!showStats)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                      showStats 
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
                        : 'bg-white/5 text-gray-500 border border-white/10 hover:bg-white/10 hover:text-gray-300'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
                    {showStats ? "Hide Stats" : "Show Stats"}
                  </button>
                </div>
                <div className="text-xl font-bold text-green-400 h-8 flex items-center justify-center gap-2">
                  {detectedNote ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      {detectedNote}
                    </>
                  ) : (
                    <span className="text-gray-600 text-sm">Listening...</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <SettingsPanel settings={settings} setSettings={setSettings} />
        </div>

        {settings.inputMode && showStats && (
          <div className="hidden lg:block absolute right-0 top-0 w-80 animate-slide-in-right">
            <AudioStatsPanel stats={stats} />
          </div>
        )}
      </div>

      {/* Mobile Stats Panel (below content) */}
      {settings.inputMode && showStats && (
        <div className="lg:hidden w-full max-w-md mt-8 animate-fade-in">
          <AudioStatsPanel stats={stats} />
        </div>
      )}
    </div>
  );
}

export default App;
