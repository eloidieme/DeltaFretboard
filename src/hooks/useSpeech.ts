import { useCallback } from "react";

export function useSpeech() {
  const speakChallenge = useCallback(
    (note: string, stringName: string | null) => {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();

      // Expand abbreviations
      let textToSpeak = note
        .replace("Root Pos.", "Root Position")
        .replace("1st Inv.", "First Inversion")
        .replace("2nd Inv.", "Second Inversion")
        .replace("#", " sharp")
        .replace("b", " flat")
        .replace("m7", " minor seven") // Order matters: m7 before m
        .replace("7", " dominant seven");

      // Handle "A" pronunciation in note names
      // We need to be careful not to replace "A" in "Major" or "Triad"
      // Regex to match "A" only when it's a note name (start of string or preceded by space, followed by space or end)
      // But simpler: split by space, process each part.
      const parts = textToSpeak.split(" ");
      const processedParts = parts.map((part) => {
        if (part === "A" || part === "Ab" || part === "A#") {
          return part.replace("A", "Eigh");
        }
        return part;
      });
      textToSpeak = processedParts.join(" ");

      textToSpeak = textToSpeak.toLowerCase();

      // Add "triad" if it's a triad mode (contains inversion info)
      if (textToSpeak.includes("inversion") || textToSpeak.includes("root position")) {
         textToSpeak += " triad";
      }

      let fullText = textToSpeak;
      if (stringName) {
        fullText += `, on ${stringName} string`;
      }

      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.lang = "en-US";
      utterance.rate = 1.1;
      window.speechSynthesis.speak(utterance);
    },
    []
  );

  const cancelSpeech = useCallback(() => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }, []);

  return { speakChallenge, cancelSpeech };
}
