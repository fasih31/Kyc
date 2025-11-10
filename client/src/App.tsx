import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import Landing from "@/pages/Landing";
import UserDashboard from "@/pages/UserDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import VerificationFlow from "@/pages/VerificationFlow";
import NotFound from "@/pages/not-found";
import PrivacySettings from "@/pages/PrivacySettings";
import IndustrySelector from "@/pages/IndustrySelector";
import OrganizationSettings from "@/pages/OrganizationSettings";
import MobileLogin from "@/pages/MobileLogin";

function ProtectedRoute({ component: Component, ...rest }: { component: any; path: string }) {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsAuthenticated(false);
        setLocation('/');
        return;
      }

      try {
        const response = await fetch('/api/auth/validate-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        if (data.valid && data.faceVerified) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem('authToken');
          setLocation('/');
        }
      } catch {
        setIsAuthenticated(false);
        localStorage.removeItem('authToken');
        setLocation('/');
      }
    };

    checkAuth();
  }, [setLocation]);

  if (isAuthenticated === null) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return isAuthenticated ? <Component {...rest} /> : null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={MobileLogin} />
      <Route path="/landing" component={Landing} />
      <Route path="/industry" component={IndustrySelector} />
      <Route path="/verify">
        {(params) => <ProtectedRoute component={VerificationFlow} path="/verify" {...params} />}
      </Route>
      <Route path="/admin">
        {(params) => <ProtectedRoute component={AdminDashboard} path="/admin" {...params} />}
      </Route>
      <Route path="/dashboard">
        {(params) => <ProtectedRoute component={UserDashboard} path="/dashboard" {...params} />}
      </Route>
      <Route path="/privacy">
        {(params) => <ProtectedRoute component={PrivacySettings} path="/privacy" {...params} />}
      </Route>
      <Route path="/organization">
        {(params) => <ProtectedRoute component={OrganizationSettings} path="/organization" {...params} />}
      </Route>
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