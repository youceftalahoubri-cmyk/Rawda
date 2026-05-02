import { Link, useSearch } from "wouter";
import { Layout } from "@/components/layout";
import { useListStories, useListCategories } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Search, Star, BookOpen, X, Loader2, ArrowUpDown } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HighlightText } from "@/components/highlight-text";
import { usePageTitle } from "@/hooks/use-page-title";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function Library() {
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const initialCategory = params.get("category") || "all";

  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState<string>(initialCategory);
  const [difficulty, setDifficulty] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  usePageTitle("The Library");
  const searchRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useDebounce(searchInput, 320);
  const isTyping = searchInput !== debouncedSearch;

  const { data: stories, isLoading: isStoriesLoading } = useListStories({
    search: debouncedSearch || undefined,
    categoryId: category !== "all" ? parseInt(category) : undefined,
    difficulty: difficulty !== "all" ? (difficulty as "beginner" | "intermediate" | "advanced") : undefined,
    sortBy: sortBy as "newest" | "popular" | "shortest" | "longest" | "xp",
  });

  const { data: categories } = useListCategories();

  const clearSearch = useCallback(() => {
    setSearchInput("");
    searchRef.current?.focus();
  }, []);

  const hasFilters = searchInput || category !== "all" || difficulty !== "all" || sortBy !== "newest";
  const clearAll = () => { setSearchInput(""); setCategory("all"); setDifficulty("all"); setSortBy("newest"); };

  // ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isSearching = isStoriesLoading || isTyping;

  return (
    <Layout>
      <div className="bg-muted/30 border-b border-border/40 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-2">The Library</h1>
          <p className="text-muted-foreground max-w-2xl">
            Explore our collection of Islamic stories and biographies. Search by title, theme, or lesson.
          </p>

          <div className="mt-8 flex flex-col md:flex-row gap-4">
            {/* Search input */}
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none transition-colors group-focus-within:text-primary" />
              <Input
                ref={searchRef}
                placeholder="Search stories, themes, lessons…"
                className="pl-10 pr-28 h-12 bg-background text-base focus-visible:ring-primary/40"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {isSearching && debouncedSearch && (
                  <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                )}
                {searchInput && (
                  <button
                    onClick={clearSearch}
                    className="flex items-center justify-center h-5 w-5 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
                {!searchInput && (
                  <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted border border-border rounded">
                    ⌘K
                  </kbd>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[155px] h-12 bg-background">
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
                <SelectTrigger className="w-[135px] h-12 bg-background">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px] h-12 bg-background">
                  <ArrowUpDown className="h-4 w-4 mr-2 opacity-50" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="shortest">Shortest</SelectItem>
                  <SelectItem value="longest">Longest</SelectItem>
                  <SelectItem value="xp">Highest XP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Result count + clear */}
          <AnimatePresence mode="wait">
            {!isSearching && hasFilters && (
              <motion.div
                key="result-bar"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center justify-between mt-4"
              >
                <p className="text-sm text-muted-foreground">
                  {stories?.length === 0 ? (
                    "No stories match your search"
                  ) : (
                    <>
                      <span className="font-semibold text-foreground">{stories?.length}</span>{" "}
                      {stories?.length === 1 ? "story" : "stories"} found
                      {debouncedSearch && (
                        <> for <span className="text-primary font-medium">"{debouncedSearch}"</span></>
                      )}
                    </>
                  )}
                </p>
                <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">
                  Clear all filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {isStoriesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-[300px] rounded-xl" />)}
          </div>
        ) : stories?.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24"
          >
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
            <h3 className="text-xl font-serif font-medium text-foreground mb-2">No stories found</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              {debouncedSearch
                ? `Nothing matched "${debouncedSearch}". Try a different word or clear the filters.`
                : "Try adjusting your filters."}
            </p>
            <Button variant="outline" className="mt-6" onClick={clearAll}>
              Clear Filters
            </Button>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            layout
          >
            <AnimatePresence mode="popLayout">
              {stories?.map((story, index) => (
                <motion.div
                  key={story.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ delay: index * 0.04 }}
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
                          <HighlightText text={story.title} query={debouncedSearch} />
                        </h3>

                        <p className="text-muted-foreground text-sm flex-1 line-clamp-3 mb-6">
                          <HighlightText text={story.excerpt} query={debouncedSearch} />
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
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
