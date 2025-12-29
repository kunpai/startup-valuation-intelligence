import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Calculator from "@/pages/Calculator";
import MarketComps from "@/pages/MarketComps";
import Scenarios from "@/pages/Scenarios";
import Reports from "@/pages/Reports";
import ReportDetail from "@/pages/ReportDetail";
import DealRoom from "@/pages/DealRoom";
import Onboarding from "@/pages/Onboarding";
import PlatformOverview from "@/pages/PlatformOverview";
import Landing from "@/pages/Landing";
import { ValuationProvider, useValuation } from "@/context/ValuationContext";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

function AuthenticatedRouter() {
  const { isDemoMode, currentCompanyId } = useValuation();

  return (
    <Switch>
      <Route path="/onboarding" component={Onboarding} />
      
      <Route>
         <AppLayout>
            <Switch>
                <Route path="/" component={isDemoMode && !currentCompanyId ? PlatformOverview : Dashboard} />
                <Route path="/guide" component={PlatformOverview} />
                <Route path="/calculator" component={Calculator} />
                <Route path="/comparables" component={MarketComps} />
                <Route path="/scenarios" component={Scenarios} />
                <Route path="/reports" component={Reports} />
                <Route path="/reports/deal-room" component={DealRoom} />
                <Route path="/reports/:id" component={ReportDetail} />
                <Route component={NotFound} />
            </Switch>
         </AppLayout>
      </Route>
    </Switch>
  );
}

function Router() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Landing />;
  }

  return (
    <ValuationProvider>
      <AuthenticatedRouter />
    </ValuationProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
