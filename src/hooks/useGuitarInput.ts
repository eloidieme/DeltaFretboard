import { useState, useEffect, useRef, useCallback } from "react";
import { YIN } from "pitchfinder";

export interface GuitarInputState {
  detectedNote: string | null;
  isStable: boolean;
  frequency: number | null;
  noteName: string | null; // e.g., "A", "C#"
}

const MIDDLE_A = 440;

// Helper to get note from frequency
const getNoteFromFrequency = (frequency: number): string | null => {
  if (!frequency || frequency < 50 || frequency > 1500) return null; // Filter noise

  // Calculate semitones from A4
  const n = 12 * Math.log2(frequency / MIDDLE_A);
  const nRounded = Math.round(n);
  
  // A4 is index 0 in our relative scale if we map to NOTE_VALUES?
  // NOTE_VALUES: A=0, A#=1, ... G#=11.
  // A4 (440) -> 0.
  // We need to map nRounded to 0-11.
  
  // nRounded = 0 -> A
  // nRounded = 1 -> A#
  // nRounded = -1 -> G#
  
  let noteIndex = nRounded % 12;
  if (noteIndex < 0) noteIndex += 12;
  
  // Find note name from NOTE_VALUES
  // NOTE_VALUES is { A: 0, "A#": 1, ... }
  // We need reverse mapping.
  
  const CANONICAL_NOTES = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
  return CANONICAL_NOTES[noteIndex];
};

export function useGuitarInput(enabled: boolean) {
  const [inputState, setInputState] = useState<GuitarInputState>({
    detectedNote: null,
    isStable: false,
    frequency: null,
    noteName: null,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const requestRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Stability buffer
  const historyRef = useRef<string[]>([]);
  const STABILITY_THRESHOLD = 5; // Number of consistent frames

  useEffect(() => {
    if (!enabled) {
      cleanup();
      return;
    }

    const startAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;
        
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 4096; // Higher FFT size for better low frequency resolution
        analyserRef.current = analyser;
        
        const source = audioContext.createMediaStreamSource(stream);
        sourceRef.current = source;
        source.connect(analyser);
        
        // YIN algorithm with tweaked threshold
        const detectPitch = YIN({ sampleRate: audioContext.sampleRate, threshold: 0.15 });
        const buffer = new Float32Array(analyser.fftSize);
        
        const updatePitch = () => {
          analyser.getFloatTimeDomainData(buffer);
          const frequency = detectPitch(buffer);
          
          if (frequency) {
            const note = getNoteFromFrequency(frequency);
            
            if (note) {
              historyRef.current.push(note);
              if (historyRef.current.length > STABILITY_THRESHOLD) {
                historyRef.current.shift();
              }
              
              // Check stability
              const isStable = historyRef.current.length === STABILITY_THRESHOLD && 
                               historyRef.current.every(n => n === note);
              
              // Format for display (e.g., "A#" -> "A#/Bb")
              let displayNote = note;
              if (note.includes("#")) {
                const map: Record<string, string> = {
                  "A#": "A#/Bb",
                  "C#": "C#/Db",
                  "D#": "D#/Eb",
                  "F#": "F#/Gb",
                  "G#": "G#/Ab",
                };
                if (map[note]) displayNote = map[note];
              }

              setInputState({
                detectedNote: note,
                isStable,
                frequency,
                noteName: displayNote,
              });
            } else {
               // Noise or out of range
               // Keep previous state or reset?
               // Let's reset stability if we lose signal
               historyRef.current = [];
               setInputState(prev => ({ ...prev, isStable: false }));
            }
          }
          
          requestRef.current = requestAnimationFrame(updatePitch);
        };
        
        updatePitch();
        
      } catch (err) {
        console.error("Error accessing microphone:", err);
        // Handle error (maybe set a state to show error in UI)
      }
    };

    startAudio();

    return cleanup;
  }, [enabled]);

  const cleanup = useCallback(() => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    if (sourceRef.current) sourceRef.current.disconnect();
    if (analyserRef.current) analyserRef.current.disconnect();
    if (audioContextRef.current) audioContextRef.current.close();
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    
    audioContextRef.current = null;
    analyserRef.current = null;
    sourceRef.current = null;
    requestRef.current = null;
    streamRef.current = null;
    historyRef.current = [];
  }, []);

  return inputState;
}
