import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { 
  useGetUser, 
  useGetUserProgress,
  useGetUserBookmarks,
  useGetUserReflections,
  getGetUserQueryKey,
  getGetUserProgressQueryKey,
  getGetUserBookmarksQueryKey,
  getGetUserReflectionsQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Flame, Star, Trophy, Clock, Medal, Bookmark } from "lucide-react";
import { motion } from "framer-motion";

const HARDCODED_USER_ID = 1;

export default function Dashboard() {
  const { data: user, isLoading: isUserLoading } = useGetUser(HARDCODED_USER_ID, {
    query: { queryKey: getGetUserQueryKey(HARDCODED_USER_ID) }
  });
  
  const { data: progress, isLoading: isProgressLoading } = useGetUserProgress(HARDCODED_USER_ID, {
    query: { queryKey: getGetUserProgressQueryKey(HARDCODED_USER_ID) }
  });
  
  const { data: bookmarks, isLoading: isBookmarksLoading } = useGetUserBookmarks(HARDCODED_USER_ID, {
    query: { queryKey: getGetUserBookmarksQueryKey(HARDCODED_USER_ID) }
  });
  
  const { data: reflections, isLoading: isReflectionsLoading } = useGetUserReflections(HARDCODED_USER_ID, {
    query: { queryKey: getGetUserReflectionsQueryKey(HARDCODED_USER_ID) }
  });

  const nextLevelXp = (progress?.level || 1) * 1000;
  const currentLevelProgress = progress ? (progress.xp % 1000) / 1000 * 100 : 0;

  if (isUserLoading || isProgressLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 space-y-8">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        
        {/* Profile Header */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
            <Avatar className="h-24 w-24 border-4 border-background shadow-md">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback className="text-3xl font-serif bg-primary text-primary-foreground">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <h1 className="text-3xl font-serif font-bold text-foreground">{user?.name}</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Trophy className="h-4 w-4 text-secondary" />
                Level {progress?.level}: <span className="font-medium text-foreground">{progress?.levelName}</span>
              </p>
              
              <div className="pt-4 max-w-md">
                <div className="flex justify-between text-sm mb-2 font-medium">
                  <span className="text-muted-foreground">{progress?.xp} XP</span>
                  <span className="text-muted-foreground">{nextLevelXp} XP</span>
                </div>
                <Progress value={currentLevelProgress} className="h-2" />
              </div>
            </div>
            
            <div className="flex gap-6 bg-background rounded-xl p-4 border border-border shadow-sm">
              <div className="text-center">
                <div className="flex items-center justify-center text-orange-500 mb-1">
                  <Flame className="h-5 w-5 fill-current" />
                </div>
                <div className="text-2xl font-bold font-serif">{progress?.streak}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Day Streak</div>
              </div>
              <div className="w-px bg-border" />
              <div className="text-center">
                <div className="flex items-center justify-center text-primary mb-1">
                  <Star className="h-5 w-5 fill-current" />
                </div>
                <div className="text-2xl font-bold font-serif">{progress?.xp}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Total XP</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Stories Read</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif">{progress?.totalStoriesRead}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Time Reading</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif">{Math.round((progress?.totalMinutesRead || 0) / 60)}h {(progress?.totalMinutesRead || 0) % 60}m</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Badges</CardTitle>
              <Medal className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif">{progress?.badges.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Reflections</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif">{reflections?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="activity" className="space-y-8">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
            <TabsTrigger value="reflections">Reflections</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-6">
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              {progress?.recentActivity.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">No recent activity. Start reading to see it here.</div>
              ) : (
                <div className="divide-y divide-border">
                  {progress?.recentActivity.map((activity, i) => (
                    <div key={i} className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Completed <Link href={`/story/${activity.storyId}`} className="text-primary hover:underline">{activity.storyTitle}</Link></p>
                          <p className="text-sm text-muted-foreground">{new Date(activity.completedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="font-medium text-secondary">
                        +{activity.xpEarned} XP
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="bookmarks">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarks?.length === 0 ? (
                <div className="col-span-full p-12 text-center text-muted-foreground bg-card border border-border rounded-xl shadow-sm">No bookmarks yet. Save stories to read them later.</div>
              ) : (
                bookmarks?.map((bookmark) => (
                  <Link key={bookmark.id} href={`/story/${bookmark.storyId}`}>
                    <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group">
                      {bookmark.storyCoverImageUrl && (
                        <div className="h-32 overflow-hidden border-b border-border/40">
                          <img src={bookmark.storyCoverImageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="" />
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">{bookmark.storyTitle}</CardTitle>
                        <CardDescription className="line-clamp-2">{bookmark.storyExcerpt}</CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="reflections" className="space-y-6">
            {reflections?.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground bg-card border border-border rounded-xl shadow-sm">No reflections yet. Write down your thoughts after reading a story.</div>
            ) : (
              <div className="grid gap-6">
                {reflections?.map((reflection) => (
                  <Card key={reflection.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardDescription>Story</CardDescription>
                          <CardTitle className="text-lg">
                            <Link href={`/story/${reflection.storyId}`} className="hover:text-primary transition-colors">
                              {reflection.storyTitle}
                            </Link>
                          </CardTitle>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">{new Date(reflection.createdAt).toLocaleDateString()}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground/90 whitespace-pre-wrap">{reflection.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="badges">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {progress?.badges.length === 0 ? (
                <div className="col-span-full p-12 text-center text-muted-foreground bg-card border border-border rounded-xl shadow-sm">No badges earned yet. Keep reading to unlock achievements!</div>
              ) : (
                progress?.badges.map((badge) => (
                  <Card key={badge.id} className="text-center overflow-hidden">
                    <CardHeader className="pt-8 pb-4">
                      <div className="mx-auto h-16 w-16 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mb-4">
                        <Medal className="h-8 w-8" />
                      </div>
                      <CardTitle className="text-lg">{badge.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{badge.description}</CardDescription>
                      <p className="text-xs text-muted-foreground mt-4">
                        Earned {new Date(badge.earnedAt || "").toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

      </div>
    </Layout>
  );
}