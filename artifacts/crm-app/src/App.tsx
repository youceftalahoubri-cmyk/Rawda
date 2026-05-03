import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AudioProvider } from "@/contexts/audio-context";
import { LanguageProvider } from "@/contexts/language-context";

import Home from "@/pages/home";
import Library from "@/pages/library";
import StoryPage from "@/pages/story";
import Dashboard from "@/pages/dashboard";
import Leaderboard from "@/pages/leaderboard";
import Ramadan from "@/pages/ramadan";
import SignInPage from "@/pages/sign-in";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/library" component={Library} />
      <Route path="/story/:id" component={StoryPage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/ramadan" component={Ramadan} />
      <Route path="/sign-in" component={SignInPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="rawdat-theme">
        <LanguageProvider>
          <AudioProvider>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Router />
              </WouterRouter>
              <Toaster />
            </TooltipProvider>
          </AudioProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
