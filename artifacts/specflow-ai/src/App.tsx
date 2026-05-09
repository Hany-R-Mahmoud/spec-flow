import { useEffect, useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/layout/AppShell";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { DensityProvider } from "@/components/providers/density-provider";
import { AuthProvider, useAuth } from "@/components/providers/auth-provider";
import { SessionProvider } from "@/store/session-store";
import { Dashboard } from "@/pages/Dashboard";
import { NewBreakdown } from "@/pages/NewBreakdown";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { WorkflowWorkspace } from "@/pages/WorkflowWorkspace";
import { ReviewsPage } from "@/pages/ReviewsPage";
import { ExportsPage } from "@/pages/ExportsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { LoginPage } from "@/pages/LoginPage";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function useApiReady(): boolean {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: number | null = null;

    const check = async (): Promise<void> => {
      try {
        const response = await fetch("/api/healthz", { method: "GET" });
        if (cancelled) {
          return;
        }

        if (response.ok) {
          setIsReady(true);
          return;
        }
      } catch {
        // Keep polling until API is ready.
      }

      timeoutId = window.setTimeout(check, 250);
    };

    void check();

    return () => {
      cancelled = true;
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  return isReady;
}

function Router() {
  const [location] = useLocation();
  const { status, isSignedIn, isTokenReady, workspaceId } = useAuth();
  const isApiReady = useApiReady();
  const isLoginRoute = location === "/login" || location.startsWith("/login/");

  if (location === "/signup" || location.startsWith("/signup/")) {
    return <Redirect to={isSignedIn ? "/" : "/login"} />;
  }

  if (isSignedIn && isLoginRoute) {
    return <Redirect to="/" />;
  }

  if (isLoginRoute) {
    return <LoginPage />;
  }

  if (status === "loading" || (isSignedIn && (!isTokenReady || !isApiReady))) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <div className="max-w-sm space-y-3">
          <div className="mx-auto h-10 w-10 animate-pulse rounded-full border border-border bg-card" />
          <p className="text-sm font-medium text-foreground">Loading your Clerk session...</p>
          <p className="text-xs text-muted-foreground">
            Restoring user access and waiting for API readiness.
          </p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Redirect to="/login" />;
  }

  return (
    <SessionProvider key={workspaceId ?? "workspace"}>
      <AppShell>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/new" component={NewBreakdown} />
          <Route path="/projects" component={ProjectsPage} />
          <Route path="/workspace/:id" component={WorkflowWorkspace} />
          <Route path="/reviews" component={ReviewsPage} />
          <Route path="/exports" component={ExportsPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route component={NotFound} />
        </Switch>
      </AppShell>
    </SessionProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <DensityProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Router />
              </WouterRouter>
              <Toaster />
            </TooltipProvider>
          </QueryClientProvider>
        </AuthProvider>
      </DensityProvider>
    </ThemeProvider>
  );
}

export default App;
