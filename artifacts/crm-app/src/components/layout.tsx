import { Link, useLocation } from "wouter";
import { useTheme } from "@/components/theme-provider";
import { BookOpen, Moon, Sun, User, Trophy, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground selection:bg-primary/20">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="font-serif font-bold text-xl tracking-tight text-primary">Rawdat</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/library" className={`transition-colors hover:text-primary ${location === '/library' ? 'text-primary' : 'text-muted-foreground'}`}>
                Library
              </Link>
              <Link href="/dashboard" className={`transition-colors hover:text-primary ${location === '/dashboard' ? 'text-primary' : 'text-muted-foreground'}`}>
                Dashboard
              </Link>
              <Link href="/leaderboard" className={`transition-colors hover:text-primary ${location === '/leaderboard' ? 'text-primary' : 'text-muted-foreground'}`}>
                Leaderboard
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/library" className="md:hidden">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Link href="/dashboard" className="hidden md:block">
              <Button variant="outline" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                Profile
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        {children}
      </main>

      <footer className="border-t border-border/40 bg-muted/20 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-primary opacity-50" />
            <span className="font-serif font-semibold text-lg text-primary opacity-50">Rawdat</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            A digital sanctuary for exploring Islamic history through beautiful storytelling.
          </p>
        </div>
      </footer>
    </div>
  );
}