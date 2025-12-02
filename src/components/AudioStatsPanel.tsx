interface AudioStatsPanelProps {
  stats: {
    reactionTimes: number[];
    totalAttempts: number;
    noteStats: Record<string, { correct: number; mistakes: number; totalTime: number }>;
  };
}

export const AudioStatsPanel: React.FC<AudioStatsPanelProps> = ({ stats }) => {
  const { reactionTimes, totalAttempts, noteStats } = stats;
  
  const correctCount = reactionTimes.length;
  const averageTime =
    reactionTimes.length > 0
      ? Math.round(
          reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
        )
      : 0;
  
  const fastestTime =
    reactionTimes.length > 0 ? Math.min(...reactionTimes) : 0;

  // Calculate detailed stats
  let mostFailedNote = "-";
  let maxMistakes = 0;
  let slowestNote = "-";
  let maxAvgTime = 0;
  let fastestNote = "-";
  let minAvgTime = Infinity;

  Object.entries(noteStats).forEach(([note, data]) => {
    if (data.mistakes > maxMistakes) {
      maxMistakes = data.mistakes;
      mostFailedNote = note;
    }
    
    if (data.correct > 0) {
      const avg = data.totalTime / data.correct;
      if (avg > maxAvgTime) {
        maxAvgTime = avg;
        slowestNote = note;
      }
      if (avg < minAvgTime) {
        minAvgTime = avg;
        fastestNote = note;
      }
    }
  });

  // Get last 20 reaction times for graph
  const graphData = reactionTimes.slice(-20);
  const maxGraphTime = Math.max(...graphData, 2000); // Scale based on max or 2s

  return (
    <div className="w-full max-w-md mt-4 p-4 rounded-xl glass-panel animate-fade-in">
      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex justify-between">
        <span>Audio Input Stats</span>
        <span className="text-blue-400">{correctCount} / {totalAttempts} Correct</span>
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-black/20 p-3 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Average Reaction</div>
          <div className="text-xl font-bold text-white">
            {averageTime > 0 ? `${(averageTime / 1000).toFixed(2)}s` : "-"}
          </div>
        </div>
        <div className="bg-black/20 p-3 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Fastest</div>
          <div className="text-xl font-bold text-green-400">
            {fastestTime > 0 ? `${(fastestTime / 1000).toFixed(2)}s` : "-"}
            <div className="bg-black/20 p-3 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Fastest Note</div>
          <div className="text-xl font-bold text-cyan-400">
            {fastestNote}
          </div>
        </div>
      </div>
        </div>
        <div className="bg-black/20 p-3 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Most Failed</div>
          <div className="text-xl font-bold text-red-400">
            {mostFailedNote} <span className="text-xs text-gray-500 font-normal">({maxMistakes})</span>
          </div>
        </div>
        <div className="bg-black/20 p-3 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Slowest Note</div>
          <div className="text-xl font-bold text-yellow-400">
            {slowestNote}
          </div>
        </div>
      </div>

      {/* Reaction Time Graph */}
      {graphData.length > 0 && (
        <div className="h-24 flex items-end gap-1 bg-black/20 rounded-lg p-2 relative overflow-hidden">
           {/* Grid lines */}
           <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
              <div className="border-b border-white h-1/4 w-full"></div>
              <div className="border-b border-white h-1/4 w-full"></div>
              <div className="border-b border-white h-1/4 w-full"></div>
           </div>

          {graphData.map((time, i) => {
            const height = Math.max(5, (time / maxGraphTime) * 100);
            const isFast = time < 1000;
            return (
              <div
                key={i}
                className={`flex-1 rounded-t-sm transition-all duration-300 ${
                  isFast ? "bg-green-500/60" : "bg-blue-500/60"
                }`}
                style={{ height: `${Math.min(100, height)}%` }}
                title={`${(time / 1000).toFixed(2)}s`}
              />
            );
          })}
        </div>
      )}
      
      {graphData.length === 0 && (
        <div className="h-24 flex items-center justify-center text-xs text-gray-600 bg-black/10 rounded-lg">
          Play notes to see reaction time graph
        </div>
      )}
    </div>
  );
};
