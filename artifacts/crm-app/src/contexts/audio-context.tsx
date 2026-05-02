import { useState, useCallback, useRef, useEffect, createContext, useContext } from "react";

export interface NarrationStory {
  id: number;
  title: string;
  content: string;
  categoryName: string;
  readingTimeMinutes: number;
}

interface AudioState {
  story: NarrationStory | null;
  isPlaying: boolean;
  isPaused: boolean;
  progress: number;
  rate: number;
  wordIndex: number;
  totalWords: number;
}

interface AudioContextValue extends AudioState {
  play: (story: NarrationStory) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setRate: (rate: number) => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

function stripHtml(html: string): string {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AudioState>({
    story: null,
    isPlaying: false,
    isPaused: false,
    progress: 0,
    rate: 1,
    wordIndex: 0,
    totalWords: 0,
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const rateRef = useRef(1);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setState(prev => ({ ...prev, isPlaying: false, isPaused: false, progress: 0, wordIndex: 0 }));
  }, []);

  const startSpeaking = useCallback((story: NarrationStory, rate: number, startWord = 0) => {
    window.speechSynthesis.cancel();

    const cleanText = stripHtml(story.content);
    const words = cleanText.split(/\s+/).filter(Boolean);
    const textToSpeak = words.slice(startWord).join(" ");
    const totalWords = words.length;

    if (!textToSpeak.trim()) return;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.lang = "en-US";

    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang === "en-US" && v.localService) || voices.find(v => v.lang.startsWith("en"));
    if (preferred) utterance.voice = preferred;

    utterance.onboundary = (e) => {
      if (e.name === "word") {
        const spokenChars = e.charIndex;
        const spokenWords = textToSpeak.slice(0, spokenChars).split(/\s+/).filter(Boolean).length;
        const currentWord = startWord + spokenWords;
        const progress = Math.min((currentWord / totalWords) * 100, 100);
        setState(prev => ({ ...prev, wordIndex: currentWord, progress }));
      }
    };

    utterance.onend = () => {
      setState(prev => ({ ...prev, isPlaying: false, isPaused: false, progress: 100, wordIndex: totalWords }));
      utteranceRef.current = null;
    };

    utterance.onerror = () => {
      setState(prev => ({ ...prev, isPlaying: false, isPaused: false }));
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);

    setState(prev => ({
      ...prev,
      story,
      isPlaying: true,
      isPaused: false,
      totalWords,
    }));
  }, []);

  const play = useCallback((story: NarrationStory) => {
    startSpeaking(story, rateRef.current, 0);
  }, [startSpeaking]);

  const pause = useCallback(() => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setState(prev => ({ ...prev, isPaused: true, isPlaying: false }));
    }
  }, []);

  const resume = useCallback(() => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setState(prev => ({ ...prev, isPaused: false, isPlaying: true }));
    }
  }, []);

  const setRate = useCallback((rate: number) => {
    rateRef.current = rate;
    setState(prev => {
      if ((prev.isPlaying || prev.isPaused) && prev.story) {
        const currentWord = prev.wordIndex;
        setTimeout(() => startSpeaking(prev.story!, rate, currentWord), 50);
      }
      return { ...prev, rate };
    });
  }, [startSpeaking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  return (
    <AudioContext.Provider value={{ ...state, play, pause, resume, stop, setRate }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useAudio must be used within AudioProvider");
  return ctx;
}
