import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Survey from "@/pages/Survey";
import Results from "@/pages/Results";
import ComingSoon from "@/pages/ComingSoon";
import Wait from "@/pages/Wait";
import VerificationFailed from "@/pages/VerificationFailed";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/survey" component={Survey} />
      <Route path="/results/:reportId" component={Results} />
      <Route path="/wait/:reportId" component={Wait} />
      <Route path="/verification-failed" component={VerificationFailed} />
      <Route path="/coming-soon" component={ComingSoon} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
