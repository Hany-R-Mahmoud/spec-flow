import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/layout/AppShell";
import { SessionProvider } from "@/store/session-store";
import { Dashboard } from "@/pages/Dashboard";
import { NewBreakdown } from "@/pages/NewBreakdown";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { WorkflowWorkspace } from "@/pages/WorkflowWorkspace";
import { ReviewsPage } from "@/pages/ReviewsPage";
import { ExportsPage } from "@/pages/ExportsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
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
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}

export default App;
