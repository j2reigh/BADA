import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Survey from "@/pages/Survey";
import ResultsV3 from "@/pages/ResultsV3";
import DebugResults from "@/pages/DebugResults";
import ComingSoon from "@/pages/ComingSoon";
import Wait from "@/pages/Wait";
import VerificationFailed from "@/pages/VerificationFailed";
import FAQ from "@/pages/FAQ";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/gift">{(_params: any) => <Landing showGiftModal={true} />}</Route>
      <Route path="/survey" component={Survey} />
      <Route path="/results/:reportId" component={ResultsV3} />
      <Route path="/debug-results" component={DebugResults} />
      <Route path="/wait/:reportId" component={Wait} />
      <Route path="/verification-failed" component={VerificationFailed} />
      <Route path="/coming-soon" component={ComingSoon} />
      <Route path="/faq" component={FAQ} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
