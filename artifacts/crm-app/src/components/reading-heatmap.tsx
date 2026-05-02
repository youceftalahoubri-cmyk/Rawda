import { useMemo, useState } from "react";
import { motion } from "framer-motion";

interface ActivityItem {
  completedAt: string;
  storyTitle: string;
  xpEarned: number;
}

interface Props {
  activity: ActivityItem[];
  weeks?: number;
}

function getIntensity(count: number): string {
  if (count === 0) return "bg-muted/60 border border-border/30";
  if (count === 1) return "bg-primary/30 border border-primary/20";
  if (count === 2) return "bg-primary/55 border border-primary/30";
  if (count === 3) return "bg-primary/75 border border-primary/40";
  return "bg-primary border border-primary/60";
}

const DAYS = ["", "Mon", "", "Wed", "", "Fri", ""];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function ReadingHeatmap({ activity, weeks = 16 }: Props) {
  const [tooltip, setTooltip] = useState<{ date: string; count: number; titles: string[]; x: number; y: number } | null>(null);

  const { grid, monthLabels, totalDays, maxStreak } = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Build a map of date → activity count and titles
    const dayMap = new Map<string, { count: number; titles: string[] }>();
    for (const a of activity) {
      const d = new Date(a.completedAt);
      const key = d.toISOString().split("T")[0];
      const entry = dayMap.get(key) ?? { count: 0, titles: [] };
      entry.count++;
      entry.titles.push(a.storyTitle);
      dayMap.set(key, entry);
    }

    // Find the Sunday that starts our grid (going back `weeks` weeks)
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - today.getDay() - (weeks - 1) * 7);
    startDate.setHours(0, 0, 0, 0);

    // Build the grid: columns = weeks, rows = days of week (Sun→Sat)
    const columns: Array<Array<{ date: Date; key: string; count: number; titles: string[]; isFuture: boolean }>> = [];
    const seenMonths = new Map<number, number>(); // month → column index

    for (let w = 0; w < weeks; w++) {
      const col = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + w * 7 + d);
        const key = date.toISOString().split("T")[0];
        const isFuture = date > today;
        const entry = dayMap.get(key) ?? { count: 0, titles: [] };

        if (!seenMonths.has(date.getMonth()) && date.getDate() <= 7) {
          seenMonths.set(date.getMonth(), w);
        }

        col.push({ date, key, count: isFuture ? -1 : entry.count, titles: entry.titles, isFuture });
      }
      columns.push(col);
    }

    // Build month labels: [{ label, col }]
    const monthLabels = Array.from(seenMonths.entries())
      .map(([month, col]) => ({ label: MONTHS[month], col }))
      .sort((a, b) => a.col - b.col);

    // Total days with at least one read
    const activeDays = new Set(
      activity.map(a => new Date(a.completedAt).toISOString().split("T")[0])
    );
    
    // Max streak from activity
    const sortedDays = [...activeDays].sort();
    let maxStreak = 0;
    let cur = 0;
    for (let i = 0; i < sortedDays.length; i++) {
      if (i === 0) { cur = 1; continue; }
      const prev = new Date(sortedDays[i - 1]);
      const curr = new Date(sortedDays[i]);
      const diff = (curr.getTime() - prev.getTime()) / 86400000;
      cur = diff === 1 ? cur + 1 : 1;
      maxStreak = Math.max(maxStreak, cur);
    }

    return { grid: columns, monthLabels, totalDays: activeDays.size, maxStreak };
  }, [activity, weeks]);

  const totalStories = activity.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground text-sm">Reading Activity</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{totalStories} stories across {totalDays} days · longest streak: {maxStreak} day{maxStreak !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className={`w-3 h-3 rounded-sm ${getIntensity(i)}`} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="relative overflow-x-auto pb-1">
        {/* Month labels */}
        <div className="flex mb-1 pl-8">
          {grid.map((_, colIdx) => {
            const label = monthLabels.find(m => m.col === colIdx);
            return (
              <div key={colIdx} className="w-4 flex-shrink-0 text-[10px] text-muted-foreground leading-none">
                {label ? label.label : ""}
              </div>
            );
          })}
        </div>

        {/* Grid */}
        <div className="flex gap-0">
          {/* Day labels */}
          <div className="flex flex-col gap-0.5 mr-1.5 flex-shrink-0">
            {DAYS.map((d, i) => (
              <div key={i} className="h-3.5 w-6 text-[10px] text-muted-foreground flex items-center justify-end pr-1 leading-none">
                {d}
              </div>
            ))}
          </div>

          {/* Cells */}
          <div className="flex gap-0.5">
            {grid.map((col, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-0.5">
                {col.map((cell, rowIdx) => (
                  <motion.div
                    key={cell.key}
                    className={`w-3.5 h-3.5 rounded-sm cursor-default transition-all ${
                      cell.isFuture
                        ? "bg-transparent"
                        : getIntensity(cell.count)
                    } ${cell.count > 0 ? "cursor-pointer hover:ring-2 hover:ring-primary/50 hover:scale-125" : ""}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (colIdx * 7 + rowIdx) * 0.002, duration: 0.15 }}
                    onMouseEnter={(e) => {
                      if (cell.isFuture) return;
                      const rect = (e.target as HTMLElement).getBoundingClientRect();
                      const parentRect = (e.target as HTMLElement).closest(".relative")!.getBoundingClientRect();
                      setTooltip({
                        date: cell.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }),
                        count: cell.count,
                        titles: cell.titles,
                        x: rect.left - parentRect.left + rect.width / 2,
                        y: rect.top - parentRect.top,
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute z-20 pointer-events-none bg-popover border border-border rounded-lg shadow-lg px-3 py-2 text-xs -translate-x-1/2 -translate-y-full -mt-2"
            style={{ left: tooltip.x + 32, top: tooltip.y }}
          >
            <p className="font-semibold text-foreground mb-1">{tooltip.date}</p>
            {tooltip.count === 0 ? (
              <p className="text-muted-foreground">No stories read</p>
            ) : (
              <>
                <p className="text-primary font-medium">{tooltip.count} {tooltip.count === 1 ? "story" : "stories"} read</p>
                <ul className="mt-1 space-y-0.5">
                  {tooltip.titles.map((t, i) => (
                    <li key={i} className="text-muted-foreground truncate max-w-[180px]">· {t}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
