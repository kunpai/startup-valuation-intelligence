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
import { ValuationProvider, useValuation } from "@/context/ValuationContext";
import { ThemeProvider } from "@/components/theme-provider";

function Router() {
  const { isDemoMode, currentCompanyId } = useValuation();

  return (
    <Switch>
      <Route path="/onboarding" component={Onboarding} />
      
      {/* Protect other routes with Layout */}
      <Route>
         <AppLayout>
            <Switch>
                {/* Show guide page as default for new users (demo mode with no company) */}
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <ValuationProvider>
            <TooltipProvider>
            <Router />
            </TooltipProvider>
        </ValuationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
