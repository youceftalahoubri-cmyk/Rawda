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
  useGetUserReflections,
  getGetUserReflectionsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bookmark, BookmarkCheck, CheckCircle2, Clock, Share2, Star, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const HARDCODED_USER_ID = 1;

export default function StoryPage() {
  const params = useParams();
  const id = parseInt(params.id || "0");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [reflectionText, setReflectionText] = useState("");
  const [readingTime, setReadingTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

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
  const recordProgress = useRecordStoryProgress(HARDCODED_USER_ID);
  const addBookmark = useAddBookmark(HARDCODED_USER_ID);
  const removeBookmark = useRemoveBookmark(HARDCODED_USER_ID);
  const createReflection = useCreateReflection(HARDCODED_USER_ID);

  const isBookmarked = bookmarks?.some(b => b.storyId === id);
  const storyReflections = reflections?.filter(r => r.storyId === id);

  // Reading time tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setReadingTime(prev => prev + 1);
    }, 60000); // Every minute
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = () => {
    if (isCompleted) return;
    
    recordProgress.mutate({ 
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
        removeBookmark.mutate({ id: bookmarkId }, {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetUserBookmarksQueryKey(HARDCODED_USER_ID) });
            toast({ title: "Bookmark removed" });
          }
        });
      }
    } else {
      addBookmark.mutate({ data: { storyId: id } }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetUserBookmarksQueryKey(HARDCODED_USER_ID) });
          toast({ title: "Story bookmarked" });
        }
      });
    }
  };

  const handlePostReflection = () => {
    if (!reflectionText.trim()) return;
    
    createReflection.mutate({ data: { storyId: id, content: reflectionText } }, {
      onSuccess: () => {
        setReflectionText("");
        queryClient.invalidateQueries({ queryKey: getGetUserReflectionsQueryKey(HARDCODED_USER_ID) });
        toast({ title: "Reflection saved" });
      }
    });
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
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
            </div>
          </div>
        </header>

        {/* Story Content */}
        <div className="container mx-auto px-4 max-w-3xl py-16">
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
            <h3 className="text-2xl font-serif font-bold mb-6">Your Reflections</h3>
            
            <div className="space-y-6 mb-8">
              <AnimatePresence>
                {storyReflections?.map(reflection => (
                  <motion.div 
                    key={reflection.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-muted/30 rounded-xl border border-border/50"
                  >
                    <p className="text-foreground/90 whitespace-pre-wrap">{reflection.content}</p>
                    <p className="text-xs text-muted-foreground mt-4 font-mono">
                      {new Date(reflection.createdAt).toLocaleDateString()}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
              {storyReflections?.length === 0 && (
                <p className="text-muted-foreground italic">No reflections yet. What are your thoughts on this story?</p>
              )}
            </div>

            <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
              <Textarea 
                placeholder="Write down your thoughts, lessons learned, or how this applies to your life..."
                className="min-h-[120px] resize-y border-none focus-visible:ring-0 text-base"
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
              />
              <div className="flex justify-end mt-4 pt-4 border-t border-border/40">
                <Button 
                  onClick={handlePostReflection}
                  disabled={!reflectionText.trim() || createReflection.isPending}
                >
                  <Send className="mr-2 h-4 w-4" /> Save Reflection
                </Button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Layout>
  );
}