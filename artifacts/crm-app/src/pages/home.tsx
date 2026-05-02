import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { 
  useGetFeaturedStories, 
  useGetDailyQuote, 
  useListCategories,
  useGetDashboardSummary
} from "@workspace/api-client-react";
import { BookOpen, ChevronRight, Clock, Star, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: featuredStories, isLoading: isFeaturedLoading } = useGetFeaturedStories();
  const { data: quote, isLoading: isQuoteLoading } = useGetDailyQuote();
  const { data: categories, isLoading: isCategoriesLoading } = useListCategories();
  const { data: summary, isLoading: isSummaryLoading } = useGetDashboardSummary();

  const featuredStory = featuredStories?.[0];

  return (
    <Layout>
      <div className="relative overflow-hidden bg-primary/5 dark:bg-primary/10 border-b border-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-secondary/20 via-transparent to-transparent opacity-50" />
        
        <div className="container mx-auto px-4 py-20 lg:py-32 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-5xl lg:text-7xl font-serif font-bold text-foreground mb-6 leading-tight">
              Discover the <span className="text-primary">Light</span> of Islamic History
            </h1>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed font-light">
              Step into a digital sanctuary of beautiful storytelling. Explore the lives, wisdom, and legacy of the righteous.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/library">
                <Button size="lg" className="h-12 px-8 text-base bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                  Enter the Library
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base font-medium">
                  View Your Progress
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 space-y-24">
        
        {/* Daily Quote */}
        <section>
          {isQuoteLoading ? (
            <Skeleton className="h-40 w-full max-w-4xl mx-auto rounded-xl" />
          ) : quote ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center p-8 lg:p-12 rounded-2xl bg-card border border-border shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-secondary to-primary/20" />
              <blockquote className="space-y-6">
                {quote.textAr && (
                  <p className="text-2xl lg:text-3xl font-serif text-foreground/90 leading-loose" dir="rtl">
                    "{quote.textAr}"
                  </p>
                )}
                <p className="text-xl lg:text-2xl font-serif text-foreground italic leading-relaxed">
                  "{quote.text}"
                </p>
                <footer className="text-sm font-medium text-muted-foreground tracking-widest uppercase">
                  — {quote.source}
                </footer>
              </blockquote>
            </motion.div>
          ) : null}
        </section>

        {/* Featured Story */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-serif font-bold text-foreground">Featured Reading</h2>
            <Link href="/library">
              <Button variant="ghost" className="text-muted-foreground hover:text-primary">
                View all <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {isFeaturedLoading ? (
            <Skeleton className="h-[400px] w-full rounded-2xl" />
          ) : featuredStory ? (
            <Link href={`/story/${featuredStory.id}`}>
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="group relative overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/50 transition-all shadow-sm hover:shadow-md cursor-pointer"
              >
                <div className="grid md:grid-cols-2 gap-8 p-8 lg:p-12 items-center">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase">
                        {featuredStory.categoryName}
                      </span>
                      <span className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-4 w-4" />
                        {featuredStory.readingTimeMinutes} min read
                      </span>
                    </div>
                    <div>
                      <h3 className="text-3xl lg:text-4xl font-serif font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                        {featuredStory.title}
                      </h3>
                      {featuredStory.titleAr && (
                        <p className="text-2xl font-serif text-muted-foreground mb-4" dir="rtl">
                          {featuredStory.titleAr}
                        </p>
                      )}
                      <p className="text-lg text-muted-foreground leading-relaxed line-clamp-3">
                        {featuredStory.excerpt}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 pt-4">
                      <div className="flex items-center text-secondary font-medium">
                        <Star className="mr-2 h-5 w-5 fill-current" />
                        +{featuredStory.xpReward} XP
                      </div>
                      <span className="text-primary font-medium flex items-center group-hover:underline underline-offset-4">
                        Begin reading <ChevronRight className="ml-1 h-4 w-4" />
                      </span>
                    </div>
                  </div>
                  {featuredStory.coverImageUrl && (
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden hidden md:block">
                      <img 
                        src={featuredStory.coverImageUrl} 
                        alt={featuredStory.title}
                        className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                  )}
                </div>
              </motion.div>
            </Link>
          ) : null}
        </section>

        {/* Categories */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Halls of Knowledge</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore different collections of stories, carefully curated to guide your learning journey.
            </p>
          </div>

          {isCategoriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories?.map((category, index) => (
                <Link key={category.id} href={`/library?category=${category.id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:border-primary/50 transition-colors hover:shadow-md cursor-pointer group">
                      <CardContent className="p-6 text-center h-full flex flex-col justify-center items-center gap-4">
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center mb-2"
                          style={{ backgroundColor: `${category.color || 'var(--primary)'}20`, color: category.color || 'var(--primary)' }}
                        >
                          <BookOpen className="h-8 w-8" />
                        </div>
                        <div>
                          <h3 className="font-serif font-bold text-xl mb-1 group-hover:text-primary transition-colors">{category.name}</h3>
                          {category.nameAr && <p className="font-serif text-sm text-muted-foreground mb-2">{category.nameAr}</p>}
                          <p className="text-sm text-muted-foreground">{category.storyCount} Stories</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Community Stats */}
        {!isSummaryLoading && summary && (
          <section className="bg-primary text-primary-foreground rounded-2xl p-8 lg:p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-secondary/40 via-transparent to-transparent opacity-50" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
              <div className="space-y-2">
                <h2 className="text-3xl font-serif font-bold">A Growing Community</h2>
                <p className="text-primary-foreground/80 max-w-md">
                  Join thousands of readers turning the pages of history every day.
                </p>
              </div>
              <div className="grid grid-cols-2 md:flex gap-8 md:gap-12">
                <div className="text-center">
                  <div className="text-4xl font-bold font-serif mb-1">{summary.totalUsers}</div>
                  <div className="text-sm text-primary-foreground/80 uppercase tracking-wider font-medium">Seekers</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold font-serif mb-1">{summary.totalStories}</div>
                  <div className="text-sm text-primary-foreground/80 uppercase tracking-wider font-medium">Stories</div>
                </div>
                <div className="text-center col-span-2 md:col-span-1">
                  <div className="text-4xl font-bold font-serif mb-1 text-secondary">{summary.storiesReadToday}</div>
                  <div className="text-sm text-primary-foreground/80 uppercase tracking-wider font-medium">Read Today</div>
                </div>
              </div>
            </div>
          </section>
        )}

      </div>
    </Layout>
  );
}