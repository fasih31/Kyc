import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/Landing";
import UserDashboard from "@/pages/UserDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import VerificationFlow from "@/pages/VerificationFlow";
import NotFound from "@/pages/not-found";
import PrivacySettings from "@/pages/PrivacySettings";
import IndustrySelector from "@/pages/IndustrySelector";
import OrganizationSettings from "@/pages/OrganizationSettings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/industry" component={IndustrySelector} />
      <Route path="/verify" component={VerificationFlow} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/dashboard" component={UserDashboard} />
      <Route path="/privacy" component={PrivacySettings} />
      <Route path="/organization" component={OrganizationSettings} />
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