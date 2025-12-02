import { useState, useRef, useCallback, useEffect } from "react";
import type { Settings } from "../types";
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

const DEFAULT_SETTINGS: Settings = {
  duration: 3,
  mode: "mixed",
  gameMode: "single",
  voiceEnabled: true,
  tickEnabled: true,
  stringMode: false,
};

export function useGameLogic() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [currentNote, setCurrentNote] = useState<string>("🎸");
  const [currentString, setCurrentString] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const timerRef = useRef<number | null>(null);
  const noteBag = useRef<string[]>([]);
  const lastStringRef = useRef<string | null>(null);

  const { playTickSound, getAudioContext } = useAudio();
  const { speakChallenge, cancelSpeech } = useSpeech();

  const getSmartNote = useCallback(() => {
    // 1. Pick a root note (using existing logic)
    let pool: string[] = [];
    if (settings.mode === "sharp") pool = SHARPS;
    else if (settings.mode === "flat") pool = FLATS;
    else pool = Array.from(new Set([...SHARPS, ...FLATS]));

    if (noteBag.current.length === 0 || !pool.includes(noteBag.current[0])) {
      const newBag = [...pool];
      for (let i = newBag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newBag[i], newBag[j]] = [newBag[j], newBag[i]];
      }
      noteBag.current = newBag;
    }

    let candidate = noteBag.current.pop() as string;

    // Smart distance check (only for single notes, or base note of chords)
    // We can keep this logic for the root note selection
    if (
      currentNote !== "🎸" &&
      currentNote !== "⏸" &&
      noteBag.current.length > 0
    ) {
      // Extract root note from current display if possible, or just skip smart logic if complex
      // For simplicity, let's just apply smart logic to the candidate root note
      // assuming currentNote might be complex.
      // If currentNote is complex, we might not easily get the previous root.
      // So let's just skip the distance check if we are not in single mode OR
      // if we can't easily parse the root.
      // Actually, let's just keep it simple:
      // If we are in single mode, we do the distance check.
      if (settings.gameMode === "single") {
        const val1 = NOTE_VALUES[currentNote] ?? -10;
        const val2 = NOTE_VALUES[candidate];
        const diff = Math.abs(val1 - val2);
        const distance = Math.min(diff, 12 - diff);

        if (distance <= 1) {
          noteBag.current.unshift(candidate);
          candidate = noteBag.current.pop() as string;
        }
      }
    }

    // 2. Format based on Game Mode
    if (settings.gameMode === "chords") {
      const quality =
        CHORD_QUALITIES[Math.floor(Math.random() * CHORD_QUALITIES.length)];
      return `${candidate} ${quality}`;
    } else if (settings.gameMode === "triads") {
      const quality =
        TRIAD_QUALITIES[Math.floor(Math.random() * TRIAD_QUALITIES.length)];
      const inversion =
        INVERSIONS[Math.floor(Math.random() * INVERSIONS.length)];
      // Shorten for display
      const shortInv = inversion
        .replace("Root Position", "Root Pos.")
        .replace("1st Inversion", "1st Inv.")
        .replace("2nd Inversion", "2nd Inv.");
      return `${shortInv} ${candidate} ${quality}`;
    }

    return candidate;
  }, [settings.mode, settings.gameMode, currentNote]);

  const getRandomString = useCallback(() => {
    let newString = STRINGS[Math.floor(Math.random() * STRINGS.length)];
    if (newString === lastStringRef.current) {
      newString = STRINGS[Math.floor(Math.random() * STRINGS.length)];
    }
    lastStringRef.current = newString;
    return newString;
  }, []);

  const nextNote = useCallback(() => {
    const note = getSmartNote();
    setCurrentNote(note);

    const str =
      settings.stringMode && settings.gameMode === "single"
        ? getRandomString()
        : null;
    setCurrentString(str);

    setTimeLeft(settings.duration * 10);

    if (settings.voiceEnabled) speakChallenge(note, str);
  }, [
    getSmartNote,
    getRandomString,
    settings.duration,
    settings.voiceEnabled,
    settings.stringMode,
    speakChallenge,
  ]);

  const stopTraining = useCallback(() => {
    setIsPlaying(false);
    setTimeLeft(settings.duration * 10);
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrentNote("⏸");
    setCurrentString(null);
    cancelSpeech();
  }, [settings.duration, cancelSpeech]);

  const startTraining = useCallback(() => {
    getAudioContext();
    setIsPlaying(true);
    nextNote();
  }, [getAudioContext, nextNote]);

  const togglePlay = useCallback(() => {
    if (isPlaying) stopTraining();
    else startTraining();
  }, [isPlaying, stopTraining, startTraining]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          const newValue = prev - 1;
          if (settings.tickEnabled && newValue > 0 && newValue % 10 === 0) {
            playTickSound(false);
          }
          if (newValue <= 0) {
            if (settings.tickEnabled) playTickSound(true);
            return 0;
          }
          return newValue;
        });
      }, 100);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, settings.tickEnabled, playTickSound]);

  useEffect(() => {
    if (isPlaying && timeLeft === 0) {
      const timeout = setTimeout(() => nextNote(), 200);
      return () => clearTimeout(timeout);
    }
  }, [timeLeft, isPlaying, nextNote]);

  useEffect(() => {
    if (!isPlaying) {
      setTimeLeft(settings.duration * 10);
    }
  }, [settings.duration, isPlaying]);

  useEffect(() => {
    noteBag.current = [];
  }, [settings.mode]);

  return {
    currentNote,
    currentString,
    timeLeft,
    isPlaying,
    settings,
    setSettings,
    togglePlay,
    stopTraining,
    nextNote,
  };
}
