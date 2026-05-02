import { useAudio, type NarrationStory } from "@/contexts/audio-context";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Square, Headphones, Gauge } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface AudioPlayerProps {
  story: NarrationStory;
}

const RATES = [0.75, 1, 1.25, 1.5, 1.75];

export function AudioPlayer({ story }: AudioPlayerProps) {
  const { play, pause, resume, stop, setRate, isPlaying, isPaused, progress, rate, story: currentStory } = useAudio();
  const [showRates, setShowRates] = useState(false);

  const isThisStory = currentStory?.id === story.id;
  const isActive = isThisStory && (isPlaying || isPaused);

  const handlePlayPause = () => {
    if (!isThisStory || (!isPlaying && !isPaused)) {
      play(story);
    } else if (isPlaying) {
      pause();
    } else if (isPaused) {
      resume();
    }
  };

  const handleStop = () => stop();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-primary/20 bg-primary/5 p-5 my-8"
      data-testid="audio-player"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Headphones className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Audio Narration</p>
          <p className="text-xs text-muted-foreground truncate">
            {isActive
              ? isPaused
                ? "Paused"
                : `Playing — ~${story.readingTimeMinutes} min`
              : `Listen to this story — ~${story.readingTimeMinutes} min`}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs font-mono text-muted-foreground hover:text-primary"
              onClick={() => setShowRates(v => !v)}
              data-testid="button-speed"
            >
              <Gauge className="h-3.5 w-3.5 mr-1" />
              {rate}x
            </Button>
            <AnimatePresence>
              {showRates && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 4 }}
                  className="absolute right-0 top-full mt-1 z-20 bg-card border border-border rounded-xl shadow-lg p-1 flex flex-col gap-0.5"
                >
                  {RATES.map(r => (
                    <button
                      key={r}
                      onClick={() => { setRate(r); setShowRates(false); }}
                      className={`text-xs font-mono px-3 py-1.5 rounded-lg text-left transition-colors ${
                        rate === r ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"
                      }`}
                      data-testid={`button-rate-${r}`}
                    >
                      {r}x
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {isActive && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={handleStop}
              data-testid="button-stop"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
            </Button>
          )}

          <Button
            size="sm"
            onClick={handlePlayPause}
            className="h-8 gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground"
            data-testid="button-play-pause"
          >
            {isPlaying && isThisStory ? (
              <><Pause className="h-3.5 w-3.5 fill-current" /> Pause</>
            ) : (
              <><Play className="h-3.5 w-3.5 fill-current" /> {isPaused && isThisStory ? "Resume" : "Listen"}</>
            )}
          </Button>
        </div>
      </div>

      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-1.5"
        >
          <div className="h-1.5 w-full bg-primary/15 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-muted-foreground/60">
            <span>{Math.round(progress)}%</span>
            <span>{Math.round((100 - progress) / 100 * story.readingTimeMinutes)} min left</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
