import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { useListStories, useListCategories } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Search, Star, BookOpen } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Library() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<string>("all");

  const { data: stories, isLoading: isStoriesLoading } = useListStories({
    search: search || undefined,
    categoryId: category !== "all" ? parseInt(category) : undefined,
    difficulty: difficulty !== "all" ? difficulty as any : undefined,
  });

  const { data: categories } = useListCategories();

  return (
    <Layout>
      <div className="bg-muted/30 border-b border-border/40 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">The Library</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Explore our collection of stories. Filter by category, difficulty, or search for something specific.
          </p>

          <div className="mt-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search stories..." 
                className="pl-10 h-12 bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[180px] h-12 bg-background">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="w-[180px] h-12 bg-background">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {isStoriesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-[300px] rounded-xl" />)}
          </div>
        ) : stories?.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium text-foreground mb-2">No stories found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
            <Button 
              variant="outline" 
              className="mt-6"
              onClick={() => { setSearch(""); setCategory("all"); setDifficulty("all"); }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories?.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/story/${story.id}`}>
                  <Card className="h-full flex flex-col hover:border-primary/50 transition-colors hover:shadow-md cursor-pointer overflow-hidden group">
                    {story.coverImageUrl && (
                      <div className="aspect-[2/1] w-full overflow-hidden border-b border-border/40">
                        <img 
                          src={story.coverImageUrl} 
                          alt={story.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 font-medium">
                          {story.categoryName}
                        </Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-1 h-4 w-4" />
                          {story.readingTimeMinutes}m
                        </div>
                      </div>
                      
                      <h3 className="font-serif font-bold text-xl mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {story.title}
                      </h3>
                      <p className="text-muted-foreground text-sm flex-1 line-clamp-3 mb-6">
                        {story.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-border/40">
                        <Badge variant="outline" className="capitalize text-xs">
                          {story.difficulty}
                        </Badge>
                        <div className="flex items-center text-secondary font-medium text-sm">
                          <Star className="mr-1 h-4 w-4 fill-current" />
                          +{story.xpReward} XP
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}