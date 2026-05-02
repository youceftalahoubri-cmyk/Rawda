import { useAudio } from "@/contexts/audio-context";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, Headphones } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";

export function AudioMiniPlayer() {
  const { story, isPlaying, isPaused, progress, pause, resume, stop } = useAudio();

  const isVisible = story && (isPlaying || isPaused);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-lg"
          data-testid="audio-mini-player"
        >
          <div className="relative bg-card/95 backdrop-blur-xl border border-primary/30 rounded-2xl shadow-xl shadow-primary/10 overflow-hidden">
            {/* Progress bar */}
            <div className="absolute top-0 left-0 h-0.5 bg-primary/20 w-full">
              <motion.div
                className="h-full bg-primary"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Headphones className="h-3.5 w-3.5 text-primary" />
              </div>

              <Link href={`/story/${story?.id}`} className="flex-1 min-w-0 group">
                <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {story?.title}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                  {isPaused ? "Paused" : "Now playing"} · {story?.categoryName}
                </p>
              </Link>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                  onClick={isPlaying ? pause : resume}
                  data-testid="mini-button-play-pause"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4 fill-current" />
                  ) : (
                    <Play className="h-4 w-4 fill-current" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={stop}
                  data-testid="mini-button-stop"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
