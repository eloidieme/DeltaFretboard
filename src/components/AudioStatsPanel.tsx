import type { TimelineAttempt, TrainingStats } from "../types";

interface AudioStatsPanelProps {
  stats: TrainingStats;
}

const formatTimestamp = (milliseconds: number) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

const resultLabel = (attempt: TimelineAttempt) => {
  if (attempt.result === "correct" && attempt.reactionTimeMs !== undefined) {
    return `${(attempt.reactionTimeMs / 1000).toFixed(2)}s`;
  }
  if (attempt.result === "timeout") return "Timeout";
  if (attempt.result === "stopped") return "Stopped";
  return "Live";
};

export const AudioStatsPanel: React.FC<AudioStatsPanelProps> = ({ stats }) => {
  const { reactionTimes, totalAttempts, noteStats, timeline } = stats;
  const correctCount = reactionTimes.length;
  const averageTime =
    reactionTimes.length > 0
      ? reactionTimes.reduce((sum, time) => sum + time, 0) /
        reactionTimes.length
      : 0;
  const fastestTime =
    reactionTimes.length > 0 ? Math.min(...reactionTimes) : 0;

  let mostFailedNote = "-";
  let maxMistakes = 0;
  let slowestNote = "-";
  let maxAverageTime = 0;

  Object.entries(noteStats).forEach(([note, data]) => {
    if (data.mistakes > maxMistakes) {
      maxMistakes = data.mistakes;
      mostFailedNote = note;
    }
    if (data.correct > 0) {
      const noteAverage = data.totalTime / data.correct;
      if (noteAverage > maxAverageTime) {
        maxAverageTime = noteAverage;
        slowestNote = note;
      }
    }
  });

  const graphData = reactionTimes.slice(-20);
  const maxGraphTime = Math.max(...graphData, 2000);

  return (
    <div className="w-full max-w-md mt-4 p-4 rounded-xl glass-panel animate-fade-in">
      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex justify-between">
        <span>Audio Input Stats</span>
        <span className="text-blue-400">
          {correctCount} / {totalAttempts} Correct
        </span>
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-5">
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
          </div>
        </div>
        <div className="bg-black/20 p-3 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Most Failed</div>
          <div className="text-xl font-bold text-red-400">
            {mostFailedNote}
            <span className="ml-1 text-xs text-gray-500 font-normal">
              ({maxMistakes})
            </span>
          </div>
        </div>
        <div className="bg-black/20 p-3 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Slowest Note</div>
          <div className="text-xl font-bold text-yellow-400">
            {slowestNote}
          </div>
        </div>
      </div>

      {graphData.length > 0 ? (
        <div className="h-20 flex items-end gap-1 bg-black/20 rounded-lg p-2 mb-5">
          {graphData.map((time, index) => {
            const height = Math.max(5, (time / maxGraphTime) * 100);
            return (
              <div
                key={`${time}-${index}`}
                className={`flex-1 rounded-t-sm ${
                  time < 1000 ? "bg-green-500/60" : "bg-blue-500/60"
                }`}
                style={{ height: `${Math.min(100, height)}%` }}
                title={`${(time / 1000).toFixed(2)}s`}
              />
            );
          })}
        </div>
      ) : (
        <div className="h-20 flex items-center justify-center text-xs text-gray-600 bg-black/10 rounded-lg mb-5">
          Play notes to see reaction times
        </div>
      )}

      <div className="border-t border-white/10 pt-4">
        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
          Timeline
        </h4>
        <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
          {timeline.length === 0 ? (
            <div className="text-xs text-gray-600 text-center py-4">
              Start a session to record prompts and played notes
            </div>
          ) : (
            timeline.map((attempt) => (
              <div
                key={attempt.id}
                className="rounded-lg bg-black/20 px-3 py-2 text-xs"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-gray-500">
                    {formatTimestamp(attempt.startedAtMs)}
                  </span>
                  <span className="font-bold text-cyan-200">
                    {attempt.target}
                    {attempt.targetString ? ` · ${attempt.targetString}` : ""}
                  </span>
                  <span
                    className={
                      attempt.result === "correct"
                        ? "text-green-400"
                        : attempt.result === "pending"
                          ? "text-blue-400"
                          : "text-orange-300"
                    }
                  >
                    {resultLabel(attempt)}
                  </span>
                </div>
                <div className="mt-1 text-gray-400">
                  Played: {attempt.playedNotes.length === 0 ? (
                    <span className="text-gray-600">-</span>
                  ) : (
                    attempt.playedNotes.map((played, index) => (
                      <span
                        key={`${played.note}-${played.atMs}-${index}`}
                        className={
                          played.correct ? "text-green-300" : "text-red-300"
                        }
                      >
                        {index > 0 ? " → " : ""}
                        {played.note} +{(played.atMs / 1000).toFixed(2)}s
                      </span>
                    ))
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
