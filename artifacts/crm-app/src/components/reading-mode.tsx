import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, AlignJustify, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReadingModeProps {
  title: string;
  titleAr?: string | null;
  content: string;
  onClose: () => void;
}

type FontSize = "sm" | "md" | "lg" | "xl";
type Spacing = "compact" | "normal" | "relaxed";
type Paper = "white" | "sepia" | "dark";

const fontSizeMap: Record<FontSize, string> = {
  sm: "text-base leading-7",
  md: "text-lg leading-8",
  lg: "text-xl leading-9",
  xl: "text-2xl leading-10",
};
const spacingMap: Record<Spacing, string> = {
  compact: "space-y-4",
  normal: "space-y-6",
  relaxed: "space-y-10",
};
const paperMap: Record<Paper, string> = {
  white: "bg-white text-gray-900",
  sepia: "bg-[#f5f0e8] text-[#3d2b1f]",
  dark: "bg-[#1a1a1a] text-[#e8e0d0]",
};
const paperLabel: Record<Paper, string> = {
  white: "White",
  sepia: "Sepia",
  dark: "Dark",
};
const paperBg: Record<Paper, string> = {
  white: "bg-white border-2 border-gray-200",
  sepia: "bg-[#f5f0e8] border-2 border-amber-200",
  dark: "bg-[#1a1a1a] border-2 border-gray-700",
};

export function ReadingMode({ title, titleAr, content, onClose }: ReadingModeProps) {
  const [fontSize, setFontSize] = useState<FontSize>("md");
  const [spacing, setSpacing] = useState<Spacing>("normal");
  const [paper, setPaper] = useState<Paper>("sepia");
  const [showControls, setShowControls] = useState(true);

  const fontSizes: FontSize[] = ["sm", "md", "lg", "xl"];
  const fontIdx = fontSizes.indexOf(fontSize);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-[100] overflow-y-auto ${paperMap[paper]}`}
      >
        {/* Controls bar */}
        <motion.div
          initial={{ y: -60 }}
          animate={{ y: 0 }}
          className="sticky top-0 z-10 border-b border-black/10 dark:border-white/10 bg-inherit backdrop-blur-sm"
        >
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
            {/* Left: font size */}
            <div className="flex items-center gap-1">
              <button
                className="p-1.5 rounded hover:bg-black/10 transition-colors disabled:opacity-30"
                onClick={() => setFontSize(fontSizes[Math.max(0, fontIdx - 1)])}
                disabled={fontIdx === 0}
                aria-label="Decrease font size"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="text-xs font-medium w-4 text-center">Aa</span>
              <button
                className="p-1.5 rounded hover:bg-black/10 transition-colors disabled:opacity-30"
                onClick={() => setFontSize(fontSizes[Math.min(fontSizes.length - 1, fontIdx + 1)])}
                disabled={fontIdx === fontSizes.length - 1}
                aria-label="Increase font size"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Center: paper swatches */}
            <div className="flex items-center gap-1.5">
              {(["white", "sepia", "dark"] as Paper[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPaper(p)}
                  className={`w-6 h-6 rounded-full transition-all ${paperBg[p]} ${paper === p ? "ring-2 ring-offset-1 ring-primary scale-110" : "hover:scale-105"}`}
                  aria-label={paperLabel[p]}
                  title={paperLabel[p]}
                />
              ))}
            </div>

            {/* Right: spacing + close */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const opts: Spacing[] = ["compact", "normal", "relaxed"];
                  const i = opts.indexOf(spacing);
                  setSpacing(opts[(i + 1) % opts.length]);
                }}
                className="p-1.5 rounded hover:bg-black/10 transition-colors"
                title={`Spacing: ${spacing}`}
                aria-label="Toggle line spacing"
              >
                <AlignJustify className="h-4 w-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded hover:bg-black/10 transition-colors"
                aria-label="Exit reading mode"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="max-w-2xl mx-auto px-6 py-12 pb-24">
          <div className="mb-10">
            <h1 className={`font-serif font-bold leading-tight mb-3 ${fontIdx >= 2 ? "text-4xl" : "text-3xl"}`}>
              {title}
            </h1>
            {titleAr && (
              <p className={`font-serif opacity-60 mb-0 ${fontIdx >= 2 ? "text-2xl" : "text-xl"}`} dir="rtl">
                {titleAr}
              </p>
            )}
          </div>

          <div
            className={`font-serif ${fontSizeMap[fontSize]} ${spacingMap[spacing]} [&_p]:mb-0 [&_em]:italic [&_strong]:font-bold`}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>

        {/* Bottom reading-mode badge */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-black/10 dark:bg-white/10 text-xs font-medium opacity-60">
          <BookOpen className="h-3 w-3" />
          Reading Mode — press <kbd className="font-mono bg-black/10 px-1 rounded">Esc</kbd> to exit
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
