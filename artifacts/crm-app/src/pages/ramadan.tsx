import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useListStories, useGetUserProgress, getGetUserProgressQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Star, CheckCircle2, Moon, Flame, BookOpen, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { usePageTitle } from "@/hooks/use-page-title";

const HARDCODED_USER_ID = 1;
const STORAGE_KEY = "rawdat-ramadan-challenge";
const TOTAL_DAYS = 30;

interface ChallengeState {
  completedDays: number[];
  startedAt: string | null;
}

function getRamadanCountdown() {
  const now = new Date();
  const year = now.getFullYear();
  // Approximate Ramadan start dates (varies by moon sighting)
  // Ramadan 2027: ~Jan 27, 2027
  const candidates = [
    new Date(`${year}-03-01`),
    new Date(`${year + 1}-02-18`),
    new Date(`${year + 1}-03-01`),
  ];
  const future = candidates.filter(d => d > now).sort((a, b) => a.getTime() - b.getTime());
  const next = future[0] || new Date(`${year + 1}-03-01`);
  const diff = next.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return { days, date: next };
}

function getIftarTime() {
  // Approximate iftar based on time of year (Mecca)
  const now = new Date();
  const month = now.getMonth();
  // Summer: ~7:15 PM, Winter: ~5:45 PM Mecca time (UTC+3)
  const baseMins = month >= 3 && month <= 8 ? 19 * 60 + 15 : 17 * 60 + 45;
  const meccaNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const currentMins = meccaNow.getUTCHours() * 60 + meccaNow.getUTCMinutes();
  const diffMins = baseMins - currentMins;
  if (diffMins <= 0) return null;
  const h = Math.floor(diffMins / 60);
  const m = diffMins % 60;
  return { hours: h, minutes: m };
}

function useChallenge() {
  const [challenge, setChallenge] = useState<ChallengeState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : { completedDays: [], startedAt: null };
    } catch {
      return { completedDays: [], startedAt: null };
    }
  });

  const save = (state: ChallengeState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setChallenge(state);
  };

  const markToday = () => {
    const today = new Date().toDateString();
    const dayIndex = challenge.startedAt
      ? Math.floor((new Date(today).getTime() - new Date(challenge.startedAt).getTime()) / 86400000) + 1
      : 1;
    if (challenge.completedDays.includes(dayIndex)) return;
    save({
      completedDays: [...challenge.completedDays, dayIndex],
      startedAt: challenge.startedAt || today,
    });
  };

  const reset = () => save({ completedDays: [], startedAt: null });

  const currentDay = challenge.startedAt
    ? Math.floor((Date.now() - new Date(challenge.startedAt).getTime()) / 86400000) + 1
    : 1;
  const todayDone = challenge.startedAt
    ? challenge.completedDays.includes(currentDay)
    : false;

  return { challenge, markToday, reset, currentDay: Math.min(currentDay, TOTAL_DAYS), todayDone };
}

export default function RamadanPage() {
  usePageTitle("Ramadan Special");
  const { data: stories, isLoading } = useListStories({ categoryId: 5 });
  const { data: progress } = useGetUserProgress(HARDCODED_USER_ID, {
    query: { queryKey: getGetUserProgressQueryKey(HARDCODED_USER_ID) }
  });
  const { challenge, markToday, reset, currentDay, todayDone } = useChallenge();
  const [countdown, setCountdown] = useState(getRamadanCountdown());
  const [iftar, setIftar] = useState(getIftarTime());
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown(getRamadanCountdown());
      setIftar(getIftarTime());
      setNow(new Date());
    }, 60000);
    return () => clearInterval(t);
  }, []);

  const completedCount = challenge.completedDays.length;
  const progressPct = Math.round((completedCount / TOTAL_DAYS) * 100);

  return (
    <Layout>
      <div className="min-h-screen">

        {/* Hero */}
        <div className="relative overflow-hidden bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white py-20 px-4">
          <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            {["✦","✧","✦","✧","✦","✧","✦","✧","✦","✧","✦","✧"].map((s, i) => (
              <span
                key={i}
                className="absolute text-white/10 text-xs"
                style={{ top: `${10 + (i * 7) % 80}%`, left: `${(i * 9) % 95}%`, fontSize: `${8 + (i % 3) * 4}px` }}
              >
                {s}
              </span>
            ))}
          </div>

          <div className="container mx-auto max-w-4xl relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <div className="flex items-center justify-center gap-3 mb-6">
                <Moon className="h-8 w-8 text-amber-300" />
                <span className="text-3xl font-serif text-amber-200 tracking-widest">رمضان كريم</span>
                <Moon className="h-8 w-8 text-amber-300 scale-x-[-1]" />
              </div>
              <h1 className="text-5xl lg:text-6xl font-serif font-bold mb-4 text-white">
                Ramadan <span className="text-amber-300">Special</span>
              </h1>
              <p className="text-lg text-white/70 max-w-xl mx-auto leading-relaxed mb-10">
                The blessed month of stories, reflection, and transformation. Read one story each day for 30 days.
              </p>

              {/* Stats row */}
              <div className="flex flex-wrap items-center justify-center gap-6">
                <div className="bg-white/10 backdrop-blur rounded-2xl px-6 py-4 text-center border border-white/10">
                  <p className="text-3xl font-bold text-amber-300">{countdown.days}</p>
                  <p className="text-xs text-white/60 uppercase tracking-wider mt-1">Days to Ramadan</p>
                  <p className="text-[10px] text-white/40 mt-1">{countdown.date.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
                </div>

                {iftar ? (
                  <div className="bg-white/10 backdrop-blur rounded-2xl px-6 py-4 text-center border border-white/10">
                    <p className="text-3xl font-bold text-amber-300">{iftar.hours}h {iftar.minutes}m</p>
                    <p className="text-xs text-white/60 uppercase tracking-wider mt-1">Until Iftar (Mecca)</p>
                    <p className="text-[10px] text-white/40 mt-1">Approximate</p>
                  </div>
                ) : (
                  <div className="bg-amber-400/20 backdrop-blur rounded-2xl px-6 py-4 text-center border border-amber-400/30">
                    <p className="text-lg font-bold text-amber-300">Iftar Time</p>
                    <p className="text-xs text-white/70 mt-1">Break your fast at sunset</p>
                  </div>
                )}

                <div className="bg-white/10 backdrop-blur rounded-2xl px-6 py-4 text-center border border-white/10">
                  <p className="text-3xl font-bold text-amber-300">{completedCount}<span className="text-lg text-white/60">/{TOTAL_DAYS}</span></p>
                  <p className="text-xs text-white/60 uppercase tracking-wider mt-1">Days Completed</p>
                  <p className="text-[10px] text-white/40 mt-1">Your challenge</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16 max-w-5xl space-y-16">

          {/* 30-Day Challenge Tracker */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
                  <Flame className="h-6 w-6 text-orange-500" />
                  30-Day Reading Challenge
                </h2>
                <p className="text-muted-foreground text-sm mt-1">Read one Islamic story every day of Ramadan</p>
              </div>
              <div className="flex items-center gap-2">
                {completedCount > 0 && (
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={reset} data-testid="button-reset-challenge">
                    Reset
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={markToday}
                  disabled={todayDone}
                  className={todayDone ? "bg-green-600 hover:bg-green-600 text-white" : "bg-primary text-primary-foreground"}
                  data-testid="button-mark-today"
                >
                  {todayDone ? (
                    <><CheckCircle2 className="h-4 w-4 mr-1.5" /> Day {currentDay} Done</>
                  ) : (
                    <>Mark Day {currentDay} Complete</>
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              {/* Progress bar */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">Progress</span>
                <span className="text-sm font-bold text-primary">{progressPct}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full mb-6 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-amber-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>

              {/* Day grid */}
              <div className="grid grid-cols-10 gap-1.5">
                {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map(day => {
                  const done = challenge.completedDays.includes(day);
                  const isCurrent = day === currentDay && challenge.startedAt;
                  return (
                    <motion.div
                      key={day}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: day * 0.015 }}
                      className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                        done
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : isCurrent
                          ? "bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-400 text-amber-700 dark:text-amber-300"
                          : "bg-muted/50 text-muted-foreground/50"
                      }`}
                      data-testid={`day-cell-${day}`}
                    >
                      {done ? <CheckCircle2 className="h-3 w-3" /> : day}
                    </motion.div>
                  );
                })}
              </div>

              {completedCount > 0 && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  {completedCount === TOTAL_DAYS
                    ? "Mashallah! You completed the full 30-day challenge."
                    : `${TOTAL_DAYS - completedCount} days remaining. Keep going!`}
                </p>
              )}
            </div>
          </section>

          {/* Ramadan Stories */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-primary" />
                  Ramadan Library
                </h2>
                <p className="text-muted-foreground text-sm mt-1">Curated stories for the blessed month</p>
              </div>
              <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">
                {stories?.length ?? 0} Stories
              </Badge>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {stories?.map((story, index) => (
                    <motion.div
                      key={story.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link href={`/story/${story.id}`}>
                        <Card className="group hover:border-primary/50 hover:shadow-md transition-all cursor-pointer" data-testid={`card-story-${story.id}`}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                  <Badge variant="secondary" className="text-xs capitalize">{story.difficulty}</Badge>
                                  {story.theme && (
                                    <span className="text-xs text-muted-foreground italic">{story.theme}</span>
                                  )}
                                </div>
                                <h3 className="text-xl font-serif font-bold text-foreground group-hover:text-primary transition-colors mb-1">
                                  {story.title}
                                </h3>
                                {story.titleAr && (
                                  <p className="text-base font-serif text-muted-foreground mb-2" dir="rtl">{story.titleAr}</p>
                                )}
                                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{story.excerpt}</p>
                              </div>
                              <div className="flex flex-col items-end gap-3 flex-shrink-0">
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {story.readingTimeMinutes}m
                                </div>
                                <div className="flex items-center text-sm text-amber-600 dark:text-amber-400 font-medium">
                                  <Star className="h-4 w-4 mr-1 fill-current" />
                                  +{story.xpReward} XP
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>

          {/* Ramadan Wisdom */}
          <section className="grid md:grid-cols-3 gap-6">
            {[
              { title: "The Fast", arabic: "الصيام", text: "Fasting is not merely abstaining from food and drink. It is abstaining from idle talk, falsehood, and all that Allah has forbidden.", source: "Prophet Muhammad (pbuh)" },
              { title: "The Night", arabic: "الليلة", text: "Seek Laylat al-Qadr in the odd nights of the last ten days of Ramadan. It is better than a thousand months.", source: "Sahih Bukhari" },
              { title: "The Gift", arabic: "الهبة", text: "When Ramadan enters, the gates of Paradise are opened, the gates of Hellfire are closed, and the devils are chained.", source: "Sahih Muslim" },
            ].map((w, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-gradient-to-b from-primary/5 to-transparent border border-primary/15 rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-serif text-lg text-primary font-bold">{w.title}</span>
                  <span className="text-muted-foreground/60 font-serif text-sm" dir="rtl">{w.arabic}</span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed italic mb-3">"{w.text}"</p>
                <p className="text-xs text-muted-foreground font-medium">— {w.source}</p>
              </motion.div>
            ))}
          </section>

          {/* CTA to Library */}
          <section className="text-center py-8">
            <p className="text-muted-foreground mb-4">Explore the full library for more stories of faith and perseverance.</p>
            <Link href="/library">
              <Button size="lg" variant="outline" className="gap-2">
                <BookOpen className="h-5 w-5" />
                Browse All Stories
              </Button>
            </Link>
          </section>
        </div>
      </div>
    </Layout>
  );
}
