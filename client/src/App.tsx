import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./context/AuthContext";

const Home = lazy(() => import("./pages/Home"));
const RoadmapPage = lazy(() => import("./pages/RoadmapPage").then((mod) => ({ default: mod.RoadmapPage })));
const TrendingPage = lazy(() => import("./pages/TrendingPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));
const SquadsPage = lazy(() => import("./pages/SquadsPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const ComparePage = lazy(() => import("./pages/ComparePage"));
const PublicProfilePage = lazy(() => import("./pages/PublicProfilePage"));

function PageFallback() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-[#1a7f4b]/20 border-t-[#1a7f4b] animate-spin" aria-label="Loading page" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/roadmap/:roadmapId"}>
          {(params) => <RoadmapPage roadmapId={params.roadmapId} />}
        </Route>
        <Route path={"/dashboard"} component={DashboardPage} />
        <Route path={"/onboarding"} component={OnboardingPage} />
        <Route path={"/compare"} component={ComparePage} />
        <Route path={"/trending"} component={TrendingPage} />
        <Route path={"/profile"} component={ProfilePage} />
        <Route path={"/u/:username"}>
          {(params) => <PublicProfilePage username={params.username} />}
        </Route>
        <Route path={"/leaderboard"} component={LeaderboardPage} />
        <Route path={"/squads"}>{() => <SquadsPage />}</Route>
        <Route path={"/squads/:squadId"}>
          {(params) => <SquadsPage squadId={params.squadId} />}
        </Route>
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
