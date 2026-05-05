import { useLocation } from 'wouter';
import { ArrowRight, FolderKanban, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSessionStore } from '@/store/session-store';
import { PhaseStatusBadge } from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';
import { Phase } from '@/lib/types';

const PHASE_ORDER: Phase[] = ['intake', 'clarification', 'prd', 'epics', 'stories', 'quality', 'devReview', 'export'];

function phaseProgress(currentPhase: Phase): number {
  const idx = PHASE_ORDER.indexOf(currentPhase);
  return Math.round(((idx + 1) / PHASE_ORDER.length) * 100);
}

export function ProjectsPage() {
  const [, setLocation] = useLocation();
  const { state, dispatch } = useSessionStore();

  if (state.isLoading) {
    return (
      <div className="space-y-3">
        <h1 className="text-lg font-semibold text-foreground">Projects</h1>
        <p className="text-xs text-muted-foreground">Loading persisted project sessions…</p>
      </div>
    );
  }

  if (state.error && state.dataSource === 'api') {
    return (
      <div className="space-y-3">
        <h1 className="text-lg font-semibold text-foreground">Projects</h1>
        <p className="text-xs text-[var(--color-danger)]">{state.error}</p>
      </div>
    );
  }

  const openSession = (sessionId: string) => {
    dispatch({ type: 'SET_ACTIVE_SESSION', payload: sessionId });
    setLocation(`/workspace/${sessionId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Projects</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Project sessions with their workflow health and handoff readiness.
          </p>
          {state.error && state.dataSource === 'demo' && (
            <p className="mt-1 text-xs text-[var(--color-warning)]">{state.error}</p>
          )}
        </div>
        <Button size="sm" onClick={() => setLocation('/new')}>
          <Plus className="mr-1.5 h-4 w-4" />
          New Breakdown
        </Button>
      </div>

      {state.sessions.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-card px-6 py-12 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-primary">
            <FolderKanban className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">No projects yet</h2>
          <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground">
            Start a breakdown to create your first project session. It will appear here with phase progress, readiness, and quick access into the workspace.
          </p>
          <Button size="sm" className="mt-4" onClick={() => setLocation('/new')}>
            <Plus className="mr-1.5 h-4 w-4" />
            Start First Breakdown
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {state.sessions.map((session) => {
            const progress = phaseProgress(session.currentPhase);
            const stories = state.stories.filter((story) => story.sessionId === session.id);
            const epics = state.epics.filter((epic) => epic.sessionId === session.id);
            const avgReadiness = stories.length > 0
              ? Math.round(stories.reduce((sum, story) => sum + story.readinessScore.total, 0) / stories.length)
              : null;

            return (
              <button
                key={session.id}
                type="button"
                onClick={() => openSession(session.id)}
                className="rounded-md border border-border bg-card p-4 text-left shadow-sm transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                data-testid={`project-card-${session.id}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-foreground">{session.name}</div>
                    <div className="mt-1 text-xs font-mono text-muted-foreground">{session.jiraKey || 'NO-KEY'}</div>
                  </div>
                  <PhaseStatusBadge status={session.phases[session.currentPhase]} />
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="capitalize">{session.currentPhase} phase</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded border border-border bg-background px-2 py-2">
                      <div className="text-muted-foreground">Epics</div>
                      <div className="mt-1 font-semibold text-foreground">{epics.length}</div>
                    </div>
                    <div className="rounded border border-border bg-background px-2 py-2">
                      <div className="text-muted-foreground">Stories</div>
                      <div className="mt-1 font-semibold text-foreground">{stories.length}</div>
                    </div>
                    <div className="rounded border border-border bg-background px-2 py-2">
                      <div className="text-muted-foreground">Readiness</div>
                      <div className={cn(
                        'mt-1 font-semibold',
                        avgReadiness === null
                          ? 'text-muted-foreground'
                          : avgReadiness >= 90
                            ? 'text-[var(--color-success)]'
                            : avgReadiness >= 75
                              ? 'text-primary'
                              : 'text-[var(--color-warning)]'
                      )}>
                        {avgReadiness === null ? '—' : `${avgReadiness}/100`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Updated {new Date(session.updatedAt).toLocaleDateString()}</span>
                    <span className="inline-flex items-center gap-1 font-medium text-primary">
                      Open Workspace
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
