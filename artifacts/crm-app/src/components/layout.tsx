import { Link, useLocation } from "wouter";
import { useTheme } from "@/components/theme-provider";
import { BookOpen, Moon, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioMiniPlayer } from "@/components/audio-mini-player";
import { MobileNav } from "@/components/mobile-nav";

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
              <Link href="/ramadan" className={`transition-colors hover:text-amber-500 flex items-center gap-1 ${location === '/ramadan' ? 'text-amber-500' : 'text-muted-foreground'}`}>
                <Moon className="h-3.5 w-3.5" />
                Ramadan
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <MobileNav />
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

      <footer className="border-t border-border/40 bg-muted/20 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="font-serif font-bold text-lg text-primary">Rawdat</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A digital sanctuary for exploring Islamic history and wisdom through beautiful storytelling.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Explore</p>
              <ul className="space-y-2 text-sm">
                {[
                  { href: "/library", label: "Story Library" },
                  { href: "/library?category=5", label: "Ramadan Special" },
                  { href: "/leaderboard", label: "Leaderboard" },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-muted-foreground hover:text-primary transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Your Journey</p>
              <ul className="space-y-2 text-sm">
                {[
                  { href: "/dashboard", label: "Dashboard" },
                  { href: "/dashboard", label: "My Reflections" },
                  { href: "/ramadan", label: "30-Day Challenge" },
                ].map(({ href, label }, i) => (
                  <li key={i}>
                    <Link href={href} className="text-muted-foreground hover:text-primary transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Rawdat. Built with care for the ummah.</p>
            <p className="text-xs text-muted-foreground italic font-serif">رَوْضَة — a garden, a meadow of delight</p>
          </div>
        </div>
      </footer>

      <AudioMiniPlayer />
    </div>
  );
}