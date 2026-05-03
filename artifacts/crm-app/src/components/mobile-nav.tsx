import { useState } from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, BookOpen, LayoutDashboard, Trophy, Moon, Home, LogIn, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLocale, localeLabels, setLocale, t, type Locale } from "@/lib/i18n";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/library", label: "Library", icon: BookOpen },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/ramadan", label: "Ramadan", icon: Moon, accent: true },
  { href: "/sign-in", label: "Sign In", icon: LogIn },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const locale = getLocale();
  const copy = t(locale);

  return (
    <>
      <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </Button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden" onClick={() => setOpen(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-background border-l border-border shadow-2xl flex flex-col md:hidden">
              <div className="flex items-center justify-between p-5 border-b border-border/40">
                <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span className="font-serif font-bold text-lg text-primary">Rawdat</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-5 w-5" /></Button>
              </div>

              <div className="p-4 border-b border-border/40">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2"><Globe className="h-3.5 w-3.5" /> {copy.nav.language}</p>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(localeLabels) as Locale[]).map((loc) => (
                    <Button key={loc} variant={locale === loc ? "default" : "outline"} size="sm" onClick={() => setLocale(loc)}>
                      {loc.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>

              <nav className="flex-1 p-4 space-y-1">
                {links.map(({ href, label, icon: Icon, accent }) => {
                  const isActive = location === href;
                  return (
                    <Link key={href} href={href} onClick={() => setOpen(false)}>
                      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? "bg-primary/10 text-primary" : accent ? "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20" : "text-foreground/70 hover:bg-muted hover:text-foreground"}`}>
                        <Icon className={`h-5 w-5 ${accent && !isActive ? "text-amber-500" : ""}`} />
                        {label}
                        {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                      </div>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-5 border-t border-border/40">
                <p className="text-xs text-muted-foreground text-center">A digital sanctuary for Islamic history</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
