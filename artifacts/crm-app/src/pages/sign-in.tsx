import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { usePageTitle } from "@/hooks/use-page-title";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/contexts/language-context";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Tab = "signin" | "signup";

export default function SignInPage() {
  usePageTitle("Sign In");
  const { t, isRtl } = useLanguage();
  const copy = t.auth;
  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: tab === "signin" ? "Welcome back!" : "Account created!",
        description: "Redirecting to your dashboard…",
      });
      setTimeout(() => navigate("/dashboard"), 800);
    }, 1200);
  };

  return (
    <Layout>
      <div className="min-h-[calc(100dvh-4rem)] flex items-center justify-center px-4 py-16 bg-muted/20">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="font-serif font-bold text-2xl text-primary">Rawdat</span>
            </div>
            <p className="text-xs text-muted-foreground italic font-serif">رَوْضَة</p>
          </div>

          <Card className="shadow-lg border-border/60">
            <CardContent className="p-0">
              {/* Tab bar */}
              <div className="grid grid-cols-2 border-b border-border/40">
                {(["signin", "signup"] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`py-4 text-sm font-medium transition-colors ${
                      tab === t
                        ? "text-primary border-b-2 border-primary bg-primary/5"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t === "signin" ? copy.button : copy.buttonSignUp}
                  </button>
                ))}
              </div>

              <div className="p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="mb-6">
                      <h1 className="text-2xl font-serif font-bold text-foreground">
                        {tab === "signin" ? copy.title : copy.titleSignUp}
                      </h1>
                      <p className="text-muted-foreground text-sm mt-1">
                        {tab === "signin" ? copy.subtitle : copy.subtitleSignUp}
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {tab === "signup" && (
                        <div>
                          <label className="text-sm font-medium block mb-1.5">{copy.name}</label>
                          <Input
                            type="text"
                            placeholder="Ahmad Al-Rashid"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-11"
                            dir={isRtl ? "rtl" : "ltr"}
                          />
                        </div>
                      )}

                      <div>
                        <label className="text-sm font-medium block mb-1.5">{copy.email}</label>
                        <Input
                          type="email"
                          placeholder="ahmad@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-11"
                          dir="ltr"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium block mb-1.5">{copy.password}</label>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-11 pr-10"
                            dir="ltr"
                            required
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-11 text-base"
                        disabled={loading || !email || !password}
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <span className="h-4 w-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                            {tab === "signin" ? copy.button : copy.buttonSignUp}
                          </span>
                        ) : (
                          tab === "signin" ? copy.button : copy.buttonSignUp
                        )}
                      </Button>
                    </form>

                    <p className="text-xs text-muted-foreground text-center mt-4">{copy.demo}</p>

                    <button
                      onClick={() => setTab(tab === "signin" ? "signup" : "signin")}
                      className="block w-full text-center text-sm text-primary hover:underline mt-4"
                    >
                      {tab === "signin" ? copy.switchToSignUp : copy.switchToSignIn}
                    </button>

                    <div className="mt-6 pt-6 border-t border-border/40 text-center">
                      <Link href="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                        ← {copy.backHome}
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
