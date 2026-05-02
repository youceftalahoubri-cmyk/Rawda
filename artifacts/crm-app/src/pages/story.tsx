import { useParams, Link } from "wouter";
import { Layout } from "@/components/layout";
import { 
  useGetStory, 
  getGetStoryQueryKey,
  useRecordStoryProgress,
  useAddBookmark,
  useRemoveBookmark,
  useGetUserBookmarks,
  getGetUserBookmarksQueryKey,
  useCreateReflection,
  useDeleteReflection,
  useGetUserReflections,
  getGetUserReflectionsQueryKey,
  useGetRelatedStories,
  getGetRelatedStoriesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bookmark, BookmarkCheck, CheckCircle2, Clock, Share2, Star, Send, Trash2, PenLine, Maximize2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { AudioPlayer } from "@/components/audio-player";
import { ScrollProgress } from "@/components/scroll-progress";
import { ReadingMode } from "@/components/reading-mode";
import { BackToTop } from "@/components/back-to-top";
import { usePageTitle } from "@/hooks/use-page-title";

const HARDCODED_USER_ID = 1;

export default function StoryPage() {
  const params = useParams();
  const id = parseInt(params.id || "0");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [reflectionText, setReflectionText] = useState("");
  const [readingTime, setReadingTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [readingMode, setReadingMode] = useState(false);

  // Queries
  const { data: story, isLoading: isStoryLoading } = useGetStory(id, { 
    query: { enabled: !!id, queryKey: getGetStoryQueryKey(id) } 
  });
  
  const { data: bookmarks } = useGetUserBookmarks(HARDCODED_USER_ID, {
    query: { queryKey: getGetUserBookmarksQueryKey(HARDCODED_USER_ID) }
  });
  
  const { data: reflections } = useGetUserReflections(HARDCODED_USER_ID, {
    query: { queryKey: getGetUserReflectionsQueryKey(HARDCODED_USER_ID) }
  });

  // Mutations
  const recordProgress = useRecordStoryProgress();
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();
  const createReflection = useCreateReflection();
  const deleteReflection = useDeleteReflection();

  const { data: related } = useGetRelatedStories(id, { limit: 3 }, {
    query: { enabled: !!id, queryKey: getGetRelatedStoriesQueryKey(id, { limit: 3 }) }
  });

  const isBookmarked = bookmarks?.some(b => b.storyId === id);
  const storyReflections = reflections?.filter(r => r.storyId === id);

  usePageTitle(story?.title);

  // Reading time tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setReadingTime(prev => prev + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Esc key exits reading mode
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setReadingMode(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleMarkAsRead = () => {
    if (isCompleted) return;
    
    recordProgress.mutate({ 
      id: HARDCODED_USER_ID,
      data: { storyId: id, completed: true, minutesSpent: readingTime } 
    }, {
      onSuccess: (data) => {
        setIsCompleted(true);
        toast({
          title: "Story Completed!",
          description: `You earned ${story?.xpReward} XP. Total XP: ${data.xp}`,
        });
      }
    });
  };

  const handleToggleBookmark = () => {
    if (isBookmarked) {
      const bookmarkId = bookmarks?.find(b => b.storyId === id)?.id;
      if (bookmarkId) {
        removeBookmark.mutate({ id: bookmarkId, storyId: id }, {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetUserBookmarksQueryKey(HARDCODED_USER_ID) });
            toast({ title: "Bookmark removed" });
          }
        });
      }
    } else {
      addBookmark.mutate({ id: HARDCODED_USER_ID, data: { storyId: id } }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetUserBookmarksQueryKey(HARDCODED_USER_ID) });
          toast({ title: "Story bookmarked" });
        }
      });
    }
  };

  const handlePostReflection = () => {
    if (!reflectionText.trim()) return;
    
    createReflection.mutate({ id: HARDCODED_USER_ID, data: { storyId: id, content: reflectionText } }, {
      onSuccess: () => {
        setReflectionText("");
        queryClient.invalidateQueries({ queryKey: getGetUserReflectionsQueryKey(HARDCODED_USER_ID) });
        toast({ title: "Reflection saved", description: "Your note has been added to your journal." });
      }
    });
  };

  const handleDeleteReflection = (reflectionId: number) => {
    deleteReflection.mutate({ id: HARDCODED_USER_ID, reflectionId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetUserReflectionsQueryKey(HARDCODED_USER_ID) });
        toast({ title: "Reflection deleted" });
      }
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = { title: story?.title ?? "Rawdat Story", text: story?.excerpt ?? "", url };
    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link copied!", description: "Share this story with someone you love." });
      }
    } catch {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied!" });
    }
  };

  if (isStoryLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-16 w-3/4 mb-4" />
          <Skeleton className="h-8 w-1/2 mb-12" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!story) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Story not found</h2>
          <Link href="/library">
            <Button>Return to Library</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ScrollProgress />
      <BackToTop />

      {readingMode && (
        <ReadingMode
          title={story.title}
          titleAr={story.titleAr}
          content={story.content}
          onClose={() => setReadingMode(false)}
        />
      )}

      <article className="pb-24">
        {/* Header Hero */}
        <header className="relative bg-muted/30 pt-20 pb-16 border-b border-border/40">
          {story.coverImageUrl && (
            <div className="absolute inset-0 z-0 opacity-10">
              <img src={story.coverImageUrl} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background" />
            </div>
          )}
          
          <div className="container mx-auto px-4 max-w-4xl relative z-10">
            <Link href="/library" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Library
            </Link>
            
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary border-none">
                {story.categoryName}
              </Badge>
              <div className="flex items-center text-sm text-muted-foreground font-medium">
                <Clock className="mr-1.5 h-4 w-4" />
                {story.readingTimeMinutes} min read
              </div>
              <div className="flex items-center text-sm text-secondary font-medium">
                <Star className="mr-1.5 h-4 w-4 fill-current" />
                +{story.xpReward} XP
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-tight mb-4">
              {story.title}
            </h1>
            
            {story.titleAr && (
              <h2 className="text-3xl md:text-4xl font-serif text-muted-foreground mb-6" dir="rtl">
                {story.titleAr}
              </h2>
            )}

            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl font-serif italic">
              {story.excerpt}
            </p>

            <div className="flex items-center gap-4 mt-8 pt-8 border-t border-border/40">
              <Button 
                variant={isBookmarked ? "default" : "outline"} 
                size="sm"
                onClick={handleToggleBookmark}
                className={isBookmarked ? "bg-primary" : ""}
                disabled={addBookmark.isPending || removeBookmark.isPending}
              >
                {isBookmarked ? (
                  <><BookmarkCheck className="mr-2 h-4 w-4" /> Bookmarked</>
                ) : (
                  <><Bookmark className="mr-2 h-4 w-4" /> Save for later</>
                )}
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hidden md:inline-flex"
                onClick={() => setReadingMode(true)}
                title="Enter distraction-free reading mode"
              >
                <Maximize2 className="mr-2 h-4 w-4" /> Read Mode
              </Button>
            </div>
          </div>
        </header>

        {/* Story Content */}
        <div className="container mx-auto px-4 max-w-3xl py-16">
          <AudioPlayer
            story={{
              id: story.id,
              title: story.title,
              content: story.content,
              categoryName: story.categoryName,
              readingTimeMinutes: story.readingTimeMinutes,
            }}
          />

          <div 
            className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-p:leading-loose prose-p:text-foreground/90"
            dangerouslySetInnerHTML={{ __html: story.content }}
          />

          {story.lessons && (
            <div className="mt-16 p-8 bg-primary/5 border border-primary/20 rounded-2xl">
              <h3 className="text-2xl font-serif font-bold text-primary mb-4 flex items-center">
                <Star className="mr-2 h-6 w-6 fill-current" />
                Key Lessons
              </h3>
              <div 
                className="prose dark:prose-invert max-w-none prose-p:text-foreground/80"
                dangerouslySetInnerHTML={{ __html: story.lessons }}
              />
            </div>
          )}

          {/* Completion Section */}
          <div className="mt-16 flex flex-col items-center justify-center py-12 border-t border-border/40 text-center">
            <h3 className="text-2xl font-serif font-bold mb-2">Finished reading?</h3>
            <p className="text-muted-foreground mb-6">Mark this story as read to track your progress and earn XP.</p>
            <Button 
              size="lg" 
              onClick={handleMarkAsRead}
              disabled={isCompleted || recordProgress.isPending}
              className={`h-14 px-8 text-lg ${isCompleted ? 'bg-secondary text-secondary-foreground opacity-100' : ''}`}
            >
              {isCompleted ? (
                <><CheckCircle2 className="mr-2 h-5 w-5" /> Completed</>
              ) : (
                "Complete & Claim XP"
              )}
            </Button>
          </div>

          {/* Reflections Section */}
          <div className="mt-16 pt-12 border-t border-border/40">
            <div className="flex items-center gap-3 mb-6">
              <PenLine className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-serif font-bold">Your Journal</h3>
              {storyReflections && storyReflections.length > 0 && (
                <span className="text-sm text-muted-foreground bg-muted rounded-full px-2.5 py-0.5">
                  {storyReflections.length} {storyReflections.length === 1 ? "note" : "notes"}
                </span>
              )}
            </div>
            
            <div className="space-y-4 mb-8">
              <AnimatePresence mode="popLayout">
                {storyReflections?.map(reflection => (
                  <motion.div 
                    key={reflection.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    className="group relative p-6 bg-muted/30 rounded-xl border-l-4 border-l-primary/30 hover:border-l-primary border border-border/50 transition-colors"
                  >
                    <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{reflection.content}</p>
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-xs text-muted-foreground">
                        {new Date(reflection.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteReflection(reflection.id)}
                        disabled={deleteReflection.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {storyReflections?.length === 0 && (
                <p className="text-muted-foreground italic text-sm">No notes yet for this story. What moved you?</p>
              )}
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                <PenLine className="h-3.5 w-3.5" /> New journal entry
              </div>
              <Textarea 
                placeholder="Write down your thoughts, lessons learned, or how this story applies to your life..."
                className="min-h-[120px] resize-y border-none focus-visible:ring-0 text-base bg-transparent p-0"
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
              />
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
                <span className="text-xs text-muted-foreground">{reflectionText.length} characters</span>
                <Button 
                  onClick={handlePostReflection}
                  disabled={!reflectionText.trim() || createReflection.isPending}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" /> Save to Journal
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* You Might Also Like */}
        {related && related.length > 0 && (
          <div className="border-t border-border/40 bg-muted/20 py-16">
            <div className="container mx-auto px-4 max-w-4xl">
              <h2 className="text-2xl font-serif font-bold text-foreground mb-2">You might also like</h2>
              <p className="text-sm text-muted-foreground mb-8">More stories from the same tradition</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {related.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Link href={`/story/${s.id}`}>
                      <div className="group bg-card border border-border rounded-2xl p-5 h-full hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                            {s.categoryName}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {s.readingTimeMinutes}m
                          </span>
                        </div>
                        <h3 className="font-serif font-bold text-base text-foreground leading-snug mb-2 group-hover:text-primary transition-colors">
                          {s.title}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1">
                          {s.excerpt}
                        </p>
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
                          <span className="text-xs text-muted-foreground capitalize">{s.difficulty}</span>
                          <span className="text-xs text-secondary font-semibold flex items-center gap-1">
                            <Star className="h-3 w-3 fill-current" /> +{s.xpReward} XP
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </article>
    </Layout>
  );
}