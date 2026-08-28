import { useState, useRef, useCallback, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import type {
  AttemptResult,
  Settings,
  TimelinePlayedNote,
  TrainingStats,
} from "../types";
import {
  SHARPS,
  FLATS,
  STRINGS,
  NOTE_VALUES,
  CHORD_QUALITIES,
  TRIAD_QUALITIES,
  INVERSIONS,
} from "../constants";
import { useAudio } from "./useAudio";
import { useSpeech } from "./useSpeech";
import { useGuitarInput } from "./useGuitarInput";

const DEFAULT_SETTINGS: Settings = {
  duration: 3,
  mode: "mixed",
  gameMode: "single",
  sessionMode: "free",
  fixedCount: 24,
  fixedTimeMinutes: 5,
  voiceEnabled: true,
  tickEnabled: true,
  stringMode: false,
  inputMode: false,
};

const loadSettings = (): Settings => {
  try {
    const saved = localStorage.getItem("delta-fretboard-settings");
    return saved
      ? { ...DEFAULT_SETTINGS, ...(JSON.parse(saved) as Partial<Settings>) }
      : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export function useGameLogic() {
  const [settings, setSettingsState] = useState<Settings>(loadSettings);
  const [currentNote, setCurrentNote] = useState<string>("🎸");
  const [currentString, setCurrentString] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(
    DEFAULT_SETTINGS.duration * 10
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [sessionDuration, setSessionDuration] = useState<number>(0);
  const [completedAttempts, setCompletedAttempts] = useState<number>(0);
  const [sessionEndReason, setSessionEndReason] = useState<string | null>(null);

  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [totalAttempts, setTotalAttempts] = useState<number>(0);
  const [noteStats, setNoteStats] = useState<
    Record<string, { correct: number; mistakes: number; totalTime: number }>
  >({});
  const [timeline, setTimeline] = useState<TrainingStats["timeline"]>([]);

  const timerRef = useRef<number | null>(null);
  const sessionTimerRef = useRef<number | null>(null);
  const fixedTimeTimerRef = useRef<number | null>(null);
  const noteBag = useRef<string[]>([]);
  const stringBag = useRef<string[]>([]);
  const lastStringRef = useRef<string | null>(null);
  const mistakeCooldownRef = useRef<number>(0);
  const sessionStartRef = useRef<number>(0);
  const promptStartRef = useRef<number>(0);
  const currentAttemptIdRef = useRef<number | null>(null);
  const nextAttemptIdRef = useRef<number>(1);
  const completedAttemptsRef = useRef<number>(0);
  const lastLoggedNoteRef = useRef<string | null>(null);
  const ignoreInputUntilRef = useRef<number>(0);

  const { playTickSound, getAudioContext, playSuccessSound } = useAudio();
  const { speakChallenge, cancelSpeech } = useSpeech();
  const { detectedNote, isStable, noteName } = useGuitarInput(
    settings.inputMode && settings.gameMode === "single"
  );

  useEffect(() => {
    localStorage.setItem("delta-fretboard-settings", JSON.stringify(settings));
  }, [settings]);

  const setSettings = useCallback<Dispatch<SetStateAction<Settings>>>((nextSettings) => {
    setSessionEndReason(null);
    setSessionDuration(0);
    setCompletedAttempts(0);
    completedAttemptsRef.current = 0;
    setSettingsState(nextSettings);
  }, []);

  const getSmartNote = useCallback(() => {
    let pool: string[] = [];
    if (settings.mode === "sharp") pool = SHARPS;
    else if (settings.mode === "flat") pool = FLATS;
    else pool = Array.from(new Set([...SHARPS, ...FLATS]));

    if (noteBag.current.length === 0 || !pool.includes(noteBag.current[0])) {
      const newBag = [...pool];
      for (let index = newBag.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [newBag[index], newBag[randomIndex]] = [
          newBag[randomIndex],
          newBag[index],
        ];
      }
      noteBag.current = newBag;
    }

    let candidate = noteBag.current.pop() as string;
    if (
      settings.gameMode === "single" &&
      currentNote !== "🎸" &&
      currentNote !== "⏸" &&
      noteBag.current.length > 0
    ) {
      const previousValue = NOTE_VALUES[currentNote] ?? -10;
      const candidateValue = NOTE_VALUES[candidate];
      const difference = Math.abs(previousValue - candidateValue);
      const distance = Math.min(difference, 12 - difference);
      if (distance <= 1) {
        noteBag.current.unshift(candidate);
        candidate = noteBag.current.pop() as string;
      }
    }

    if (settings.gameMode === "chords") {
      const quality =
        CHORD_QUALITIES[Math.floor(Math.random() * CHORD_QUALITIES.length)];
      return `${candidate} ${quality}`;
    }
    if (settings.gameMode === "triads") {
      const quality =
        TRIAD_QUALITIES[Math.floor(Math.random() * TRIAD_QUALITIES.length)];
      const inversion =
        INVERSIONS[Math.floor(Math.random() * INVERSIONS.length)]
          .replace("Root Position", "Root Pos.")
          .replace("1st Inversion", "1st Inv.")
          .replace("2nd Inversion", "2nd Inv.");
      return `${inversion} ${candidate} ${quality}`;
    }
    return candidate;
  }, [settings.mode, settings.gameMode, currentNote]);

  const getRandomString = useCallback(() => {
    if (stringBag.current.length === 0) {
      const newBag = [...STRINGS];
      for (let index = newBag.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [newBag[index], newBag[randomIndex]] = [
          newBag[randomIndex],
          newBag[index],
        ];
      }
      if (
        lastStringRef.current &&
        newBag[0] === lastStringRef.current &&
        newBag.length > 1
      ) {
        [newBag[0], newBag[newBag.length - 1]] = [
          newBag[newBag.length - 1],
          newBag[0],
        ];
      }
      stringBag.current = newBag;
    }

    const nextString = stringBag.current.shift() as string;
    lastStringRef.current = nextString;
    return nextString;
  }, []);

  const startPrompt = useCallback(() => {
    const note = getSmartNote();
    const targetString =
      settings.stringMode && settings.gameMode === "single"
        ? getRandomString()
        : null;
    const now = Date.now();
    const attemptId = nextAttemptIdRef.current;
    nextAttemptIdRef.current += 1;
    currentAttemptIdRef.current = attemptId;
    promptStartRef.current = now;
    ignoreInputUntilRef.current = now + 250;
    lastLoggedNoteRef.current = null;

    setCurrentNote(note);
    setCurrentString(targetString);
    setTimeLeft(settings.duration * 10);
    setTimeline((previous) => [
      ...previous,
      {
        id: attemptId,
        startedAtMs: Math.max(0, now - sessionStartRef.current),
        target: note,
        targetString,
        playedNotes: [],
        result: "pending",
      },
    ]);

    if (settings.voiceEnabled) speakChallenge(note, targetString);
  }, [
    getRandomString,
    getSmartNote,
    settings.duration,
    settings.gameMode,
    settings.stringMode,
    settings.voiceEnabled,
    speakChallenge,
  ]);

  const finishCurrentAttempt = useCallback(
    (result: AttemptResult, reactionTimeMs?: number) => {
      const attemptId = currentAttemptIdRef.current;
      if (attemptId === null) return;
      setTimeline((previous) =>
        previous.map((attempt) =>
          attempt.id === attemptId
            ? { ...attempt, result, reactionTimeMs }
            : attempt
        )
      );
      currentAttemptIdRef.current = null;
    },
    []
  );

  const stopSession = useCallback(
    (reason: string, finishPending: boolean) => {
      if (finishPending) finishCurrentAttempt("stopped");
      setIsPlaying(false);
      setTimeLeft(settings.duration * 10);
      setCurrentNote("⏸");
      setCurrentString(null);
      setSessionEndReason(reason);
      cancelSpeech();
      if (timerRef.current) clearInterval(timerRef.current);
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
      if (fixedTimeTimerRef.current) clearTimeout(fixedTimeTimerRef.current);
    },
    [cancelSpeech, finishCurrentAttempt, settings.duration]
  );

  const completeAndAdvance = useCallback(
    (
      result: Exclude<AttemptResult, "pending" | "stopped">,
      reactionTimeMs?: number
    ) => {
      finishCurrentAttempt(result, reactionTimeMs);
      const completed = completedAttemptsRef.current + 1;
      completedAttemptsRef.current = completed;
      setCompletedAttempts(completed);
      setTotalAttempts((previous) => previous + 1);

      if (
        settings.sessionMode === "fixed-count" &&
        completed >= settings.fixedCount
      ) {
        stopSession("Fixed number complete", false);
        return;
      }
      startPrompt();
    },
    [
      finishCurrentAttempt,
      settings.fixedCount,
      settings.sessionMode,
      startPrompt,
      stopSession,
    ]
  );

  const startTraining = useCallback(() => {
    getAudioContext();
    sessionStartRef.current = Date.now();
    completedAttemptsRef.current = 0;
    nextAttemptIdRef.current = 1;
    currentAttemptIdRef.current = null;
    setSessionDuration(0);
    setCompletedAttempts(0);
    setSessionEndReason(null);
    setReactionTimes([]);
    setTotalAttempts(0);
    setNoteStats({});
    setTimeline([]);
    setIsPlaying(true);
    startPrompt();
  }, [getAudioContext, startPrompt]);

  const stopTraining = useCallback(() => {
    stopSession("Stopped", true);
  }, [stopSession]);

  const togglePlay = useCallback(() => {
    if (isPlaying) stopTraining();
    else startTraining();
  }, [isPlaying, startTraining, stopTraining]);

  useEffect(() => {
    if (!isPlaying) return;
    timerRef.current = window.setInterval(() => {
      setTimeLeft((previous) => {
        const next = previous - 1;
        if (settings.tickEnabled && next > 0 && next % 10 === 0) {
          playTickSound(false);
        }
        if (next <= 0) {
          if (settings.tickEnabled) playTickSound(true);
          return 0;
        }
        return next;
      });
    }, 100);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playTickSound, settings.tickEnabled]);

  useEffect(() => {
    if (!isPlaying || timeLeft !== 0) return;
    const timeout = window.setTimeout(() => completeAndAdvance("timeout"), 200);
    return () => window.clearTimeout(timeout);
  }, [completeAndAdvance, isPlaying, timeLeft]);

  useEffect(() => {
    if (!isPlaying) return;
    sessionTimerRef.current = window.setInterval(() => {
      setSessionDuration((previous) => previous + 1);
    }, 1000);
    if (settings.sessionMode === "fixed-time") {
      fixedTimeTimerRef.current = window.setTimeout(
        () => stopSession("Fixed time complete", true),
        settings.fixedTimeMinutes * 60 * 1000
      );
    }
    return () => {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
      if (fixedTimeTimerRef.current) clearTimeout(fixedTimeTimerRef.current);
    };
  }, [
    isPlaying,
    settings.fixedTimeMinutes,
    settings.sessionMode,
    stopSession,
  ]);

  useEffect(() => {
    noteBag.current = [];
  }, [settings.mode, settings.gameMode]);

  const recordPlayedNote = useCallback((playedNote: TimelinePlayedNote) => {
    const attemptId = currentAttemptIdRef.current;
    if (attemptId === null) return;
    setTimeline((previous) =>
      previous.map((attempt) =>
        attempt.id === attemptId
          ? { ...attempt, playedNotes: [...attempt.playedNotes, playedNote] }
          : attempt
      )
    );
  }, []);

  useEffect(() => {
    if (
      !settings.inputMode ||
      !isPlaying ||
      !isStable ||
      !detectedNote ||
      Date.now() < ignoreInputUntilRef.current ||
      currentNote === "🎸" ||
      currentNote === "⏸"
    ) {
      return;
    }

    const match = currentNote.match(/([A-G][#b]?)/);
    if (!match) return;
    const target = match[0];
    const targetValue = NOTE_VALUES[target];
    const playedValue = NOTE_VALUES[detectedNote];
    if (targetValue === undefined || playedValue === undefined) return;

    const now = Date.now();
    const reactionTime = now - promptStartRef.current;
    const isCorrect = targetValue === playedValue;

    if (lastLoggedNoteRef.current !== detectedNote) {
      recordPlayedNote({
        note: detectedNote,
        atMs: reactionTime,
        correct: isCorrect,
      });
      lastLoggedNoteRef.current = detectedNote;
    }

    if (isCorrect) {
      setReactionTimes((previous) => [...previous, reactionTime]);
      setNoteStats((previous) => {
        const stats = previous[target] || {
          correct: 0,
          mistakes: 0,
          totalTime: 0,
        };
        return {
          ...previous,
          [target]: {
            ...stats,
            correct: stats.correct + 1,
            totalTime: stats.totalTime + reactionTime,
          },
        };
      });
      playSuccessSound();
      completeAndAdvance("correct", reactionTime);
      return;
    }

    if (now - mistakeCooldownRef.current > 1000) {
      mistakeCooldownRef.current = now;
      setNoteStats((previous) => {
        const stats = previous[target] || {
          correct: 0,
          mistakes: 0,
          totalTime: 0,
        };
        return {
          ...previous,
          [target]: { ...stats, mistakes: stats.mistakes + 1 },
        };
      });
    }
  }, [
    completeAndAdvance,
    currentNote,
    detectedNote,
    isPlaying,
    isStable,
    playSuccessSound,
    recordPlayedNote,
    settings.inputMode,
  ]);

  return {
    currentNote,
    currentString,
    timeLeft,
    isPlaying,
    settings,
    setSettings,
    togglePlay,
    sessionDuration,
    completedAttempts,
    sessionEndReason,
    detectedNote: noteName,
    stats: {
      reactionTimes,
      totalAttempts,
      noteStats,
      timeline,
    } satisfies TrainingStats,
  };
}
