import { useState } from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, BookOpen, LayoutDashboard, Trophy, Moon, Home, LogIn, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { localeLabels, type Locale } from "@/lib/i18n";
import { useLanguage } from "@/contexts/language-context";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { locale, setLocale, t } = useLanguage();

  const links = [
    { href: "/", label: t.nav.library, icon: Home },
    { href: "/library", label: t.nav.library, icon: BookOpen },
    { href: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard },
    { href: "/leaderboard", label: t.nav.leaderboard, icon: Trophy },
    { href: "/ramadan", label: t.nav.ramadan, icon: Moon, accent: true },
    { href: "/sign-in", label: t.nav.signIn, icon: LogIn },
  ];

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-80 bg-[#0f1720] text-slate-100 border-l border-white/10 shadow-2xl flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
                <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-amber-300" />
                  <span className="font-serif font-bold text-lg text-amber-100">Rawdat</span>
                </Link>
                <Button variant="ghost" size="icon" className="text-slate-100 hover:bg-white/10 hover:text-white" onClick={() => setOpen(false)} aria-label="Close menu">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-4 border-b border-white/10 bg-white/5">
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5" /> {t.nav.language}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(localeLabels) as [Locale, string][]).map(([loc, label]) => (
                    <Button
                      key={loc}
                      variant={locale === loc ? "default" : "outline"}
                      size="sm"
                      className="text-xs border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                      onClick={() => setLocale(loc)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              <nav className="flex-1 p-4 space-y-2 overflow-y-auto bg-gradient-to-b from-transparent to-black/10">
                {links.map(({ href, label, icon: Icon, accent }) => {
                  const isActive = location === href;
                  return (
                    <Link key={href} href={href} onClick={() => setOpen(false)}>
                      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-amber-400/15 text-amber-200 border border-amber-400/20"
                          : accent
                          ? "text-amber-200 hover:bg-amber-400/10 border border-transparent"
                          : "text-slate-200 hover:bg-white/8 border border-transparent"
                      }`}>
                        <Icon className={`h-5 w-5 shrink-0 ${accent && !isActive ? "text-amber-300" : ""}`} />
                        {label}
                        {isActive && <span className="ms-auto w-1.5 h-1.5 rounded-full bg-amber-300" />}
                      </div>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-5 border-t border-white/10 bg-white/5">
                <p className="text-xs text-slate-400 text-center font-serif">رَوْضَة</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
