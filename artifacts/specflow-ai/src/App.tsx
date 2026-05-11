import { useEffect, useState } from "react";
import {
  Redirect,
  Route,
  Router as WouterRouter,
  Switch,
  useLocation,
} from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/layout/AppShell";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider, useAuth } from "@/components/providers/auth-provider";
import { SessionProvider } from "@/store/session-store";
import { Dashboard } from "@/pages/Dashboard";
import { LandingPage } from "@/pages/LandingPage";
import { NewBreakdown } from "@/pages/NewBreakdown";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { WorkflowWorkspace } from "@/pages/WorkflowWorkspace";
import { ReviewsPage } from "@/pages/ReviewsPage";
import { ExportsPage } from "@/pages/ExportsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { LoginPage } from "@/pages/LoginPage";
import NotFound from "@/pages/not-found";
import { resolveApiUrl } from "@/lib/runtime";
import { syncDocumentMetadata } from "@/lib/metadata";

const queryClient = new QueryClient();
const LEGACY_APP_PATHS = ["/new", "/projects", "/reviews", "/exports", "/settings"];

function isAuthPath(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname === "/signup" ||
    pathname.startsWith("/signup/")
  );
}

function isAppPath(pathname: string): boolean {
  return pathname === "/app" || pathname.startsWith("/app/");
}

function isLegacyAppPath(pathname: string): boolean {
  return pathname.startsWith("/workspace/") || LEGACY_APP_PATHS.includes(pathname);
}

function redirectLegacyAppPath(pathname: string): string {
  return `/app${pathname}`;
}

function LoadingScreen({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
      <div className="max-w-sm space-y-3">
        <div className="mx-auto h-10 w-10 animate-pulse rounded-full border border-border bg-card" />
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function useApiReady(): boolean {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: number | null = null;

    const check = async (): Promise<void> => {
      try {
        const response = await fetch(resolveApiUrl("/api/healthz"), {
          method: "GET",
        });
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

function AppRouteGate() {
  const { status, isSignedIn, isTokenReady, workspaceId } = useAuth();
  const isApiReady = useApiReady();

  if (status === "loading" || (isSignedIn && (!isTokenReady || !isApiReady))) {
    return (
      <LoadingScreen
        title="Loading your workspace..."
        description="Restoring your session and waiting for API readiness."
      />
    );
  }

  if (!isSignedIn) {
    return <Redirect to="/login" />;
  }

  return (
    <WouterRouter base="/app">
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
    </WouterRouter>
  );
}

function Router() {
  const [location] = useLocation();
  const { status, isSignedIn } = useAuth();
  const isLoginRoute = isAuthPath(location);
  const isLegacyRoute = isLegacyAppPath(location);
  const isAppRoute = isAppPath(location);

  useEffect(() => {
    syncDocumentMetadata(location);
  }, [location]);

  if (status === "loading" && (isLoginRoute || isLegacyRoute || isAppRoute)) {
    return (
      <LoadingScreen
        title="Loading your session..."
        description="Checking sign-in state before routing."
      />
    );
  }

  if (isLoginRoute) {
    if (isSignedIn) {
      return <Redirect to="/app" />;
    }

    return <LoginPage />;
  }

  if (isLegacyRoute) {
    return <Redirect to={isSignedIn ? redirectLegacyAppPath(location) : "/login"} />;
  }

  if (isAppRoute) {
    return <AppRouteGate />;
  }

  if (location === "/" || location === "") {
    return <LandingPage />;
  }

  return <Redirect to={isSignedIn ? "/app" : "/login"} />;
}

function App() {
  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}

export default App;
