import { Layout } from "@/components/layout";
import { useGetLeaderboard } from "@workspace/api-client-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Flame, Medal } from "lucide-react";
import { motion } from "framer-motion";

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useGetLeaderboard();

  return (
    <Layout>
      <div className="bg-primary/5 border-b border-border/40 py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Trophy className="h-16 w-16 text-secondary mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">Hall of Seekers</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Those who strive in seeking knowledge are placed on a path to Paradise. View the most dedicated readers in our community.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          
          <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-muted-foreground uppercase tracking-wider border-b border-border bg-muted/20">
            <div className="col-span-2 text-center">Rank</div>
            <div className="col-span-5">Seeker</div>
            <div className="col-span-2 text-center hidden md:block">Level</div>
            <div className="col-span-3 md:col-span-2 text-right">XP</div>
            <div className="col-span-2 md:col-span-1 text-right">Streak</div>
          </div>

          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {leaderboard?.map((entry, index) => (
                <motion.div 
                  key={entry.userId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors hover:bg-muted/30 ${
                    entry.rank <= 3 ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="col-span-2 flex justify-center">
                    {entry.rank === 1 ? (
                      <div className="h-10 w-10 bg-yellow-400/20 text-yellow-600 rounded-full flex items-center justify-center font-bold text-lg">1</div>
                    ) : entry.rank === 2 ? (
                      <div className="h-10 w-10 bg-slate-300/20 text-slate-500 rounded-full flex items-center justify-center font-bold text-lg">2</div>
                    ) : entry.rank === 3 ? (
                      <div className="h-10 w-10 bg-amber-600/20 text-amber-700 rounded-full flex items-center justify-center font-bold text-lg">3</div>
                    ) : (
                      <div className="h-10 w-10 text-muted-foreground flex items-center justify-center font-medium">{entry.rank}</div>
                    )}
                  </div>
                  
                  <div className="col-span-5 flex items-center gap-4">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={entry.avatarUrl} />
                      <AvatarFallback className="font-serif bg-primary/10 text-primary">{entry.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-foreground">{entry.userName}</div>
                      <div className="text-xs text-muted-foreground md:hidden">{entry.levelName}</div>
                    </div>
                  </div>
                  
                  <div className="col-span-2 text-center hidden md:block">
                    <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-muted text-xs font-medium">
                      Lv. {entry.level}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{entry.levelName}</div>
                  </div>
                  
                  <div className="col-span-3 md:col-span-2 text-right font-mono font-medium text-secondary">
                    {entry.xp.toLocaleString()}
                  </div>
                  
                  <div className="col-span-2 md:col-span-1 flex items-center justify-end text-orange-500 font-medium">
                    <Flame className="h-4 w-4 mr-1 fill-current opacity-70" />
                    {entry.streak}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}