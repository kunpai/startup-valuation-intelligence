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
import Onboarding from "@/pages/Onboarding";
import { ValuationProvider, useValuation } from "@/context/ValuationContext";

function Router() {
  const { isDemoMode } = useValuation();

  return (
    <Switch>
      <Route path="/onboarding" component={Onboarding} />
      
      {/* Protect other routes with Layout */}
      <Route>
         <AppLayout>
            <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/calculator" component={Calculator} />
                <Route path="/comparables" component={MarketComps} />
                <Route path="/scenarios" component={Scenarios} />
                <Route path="/reports" component={Reports} />
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
      <ValuationProvider>
        <TooltipProvider>
          <Router />
        </TooltipProvider>
      </ValuationProvider>
    </QueryClientProvider>
  );
}

export default App;
