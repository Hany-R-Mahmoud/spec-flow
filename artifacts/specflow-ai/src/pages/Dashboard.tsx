import { useLocation } from 'wouter';
import { useSessionStore } from '@/store/session-store';
import { PhaseStatusBadge, ReviewStatusBadge } from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';
import { Plus, TrendingUp, Clock, FileDown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Phase } from '@/lib/types';

const PHASE_ORDER: Phase[] = ['intake', 'clarification', 'prd', 'epics', 'stories', 'quality', 'devReview', 'export'];

function phaseProgress(currentPhase: Phase): number {
  const idx = PHASE_ORDER.indexOf(currentPhase);
  return Math.round(((idx + 1) / PHASE_ORDER.length) * 100);
}

export function Dashboard() {
  const { state } = useSessionStore();
  const [, setLocation] = useLocation();

  const { sessions, stories, exportPackages, isLoading, error } = state;

  const avgScore = stories.length > 0
    ? Math.round(stories.reduce((sum, s) => sum + s.readinessScore.total, 0) / stories.length)
    : 0;
  const awaitingReview = stories.filter(s => s.reviewStatus === 'pending' || s.reviewStatus === 'needs-clarification').length;
  const exportsReady = exportPackages.filter(e => e.status === 'complete').length;

  const reviewQueueStories = stories.filter(s =>
    ['pending', 'needs-clarification', 'technically-risky', 'blocked'].includes(s.reviewStatus)
  ).slice(0, 5);

  const recentExports = exportPackages.slice(0, 3);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Loading persisted sessions and export history…</p>
      </div>
    );
  }

  if (error && state.dataSource === 'api') {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-[var(--color-danger)]">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {sessions.length} active breakdowns · {awaitingReview} stories awaiting review · {exportsReady} exports ready
          </p>
          {error && <p className="text-xs text-[var(--color-warning)] mt-1">{error}</p>}
        </div>
        <Button size="sm" onClick={() => setLocation('/new')} data-testid="button-new-breakdown">
          <Plus className="w-4 h-4 mr-1.5" />
          New Breakdown
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Active Breakdowns', value: sessions.length, sub: 'sessions in progress', icon: TrendingUp, color: 'text-primary', bg: 'bg-[var(--color-primary-soft)]' },
          { label: 'Avg Readiness Score', value: `${avgScore}/100`, sub: avgScore >= 75 ? 'healthy developer readiness' : 'needs quality attention', icon: TrendingUp, color: avgScore >= 75 ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]', bg: avgScore >= 75 ? 'bg-[var(--color-success-soft)]' : 'bg-[var(--color-warning-soft)]' },
          { label: 'Awaiting Dev Review', value: awaitingReview, sub: 'stories need attention', icon: Clock, color: 'text-[var(--color-warning)]', bg: 'bg-[var(--color-warning-soft)]' },
          { label: 'Jira Exports Ready', value: exportsReady, sub: 'packages ready to sync', icon: FileDown, color: 'text-[var(--color-info)]', bg: 'bg-[var(--color-info-soft)]' },
        ].map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card border border-border rounded-md p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground">{label}</span>
              <div className={cn('w-7 h-7 rounded flex items-center justify-center flex-shrink-0', bg)}>
                <Icon className={cn('w-3.5 h-3.5', color)} aria-hidden="true" />
              </div>
            </div>
            <div className={cn('text-2xl font-bold mb-0.5', color)}>{value}</div>
            <div className="text-xs text-muted-foreground">{sub}</div>
          </div>
        ))}
      </div>

      {/* Active Sessions Table */}
      <div className="bg-card border border-border rounded-md overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span id="active-sessions-title" className="text-sm font-semibold text-foreground">Active Sessions</span>
          <span className="text-xs text-muted-foreground">{sessions.length} sessions</span>
        </div>
        <table className="w-full" aria-labelledby="active-sessions-title">
          <caption className="sr-only">Active breakdown sessions with phase, progress, readiness, status, and last updated time.</caption>
          <thead>
            <tr className="bg-muted border-b border-border">
              {['Session Name', 'Phase', 'Progress', 'Readiness', 'Status', 'Updated'].map(h => (
                <th key={h} scope="col" className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-xs text-muted-foreground">
                  No active breakdowns yet. Start a new breakdown to create your first workflow session.
                </td>
              </tr>
            ) : sessions.map(session => {
              const progress = phaseProgress(session.currentPhase);
              const sessionStories = state.stories.filter(s => s.sessionId === session.id);
              const sessionScore = sessionStories.length > 0
                ? Math.round(sessionStories.reduce((sum, s) => sum + s.readinessScore.total, 0) / sessionStories.length)
                : 0;
              const updatedAgo = new Date(session.updatedAt).toLocaleDateString();

              return (
                <tr
                  key={session.id}
                  onClick={() => setLocation(`/workspace/${session.id}`)}
                  className="hover:bg-muted cursor-pointer transition-colors"
                  data-testid={`session-row-${session.id}`}
                >
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-foreground">{session.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{session.jiraKey}</div>
                  </td>
                  <td className="px-4 py-3">
                    <PhaseStatusBadge status={session.phases[session.currentPhase]} />
                    <div className="text-xs text-muted-foreground mt-0.5 capitalize">{session.currentPhase}</div>
                  </td>
                  <td className="px-4 py-3 w-36">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 flex-shrink-0">{progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {sessionScore > 0 ? (
                      <span className={cn('text-sm font-bold',
                        sessionScore >= 90 ? 'text-[var(--color-success)]' :
                        sessionScore >= 75 ? 'text-primary' :
                        sessionScore >= 60 ? 'text-[var(--color-warning)]' : 'text-[var(--color-danger)]'
                      )}>
                        {sessionScore}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <PhaseStatusBadge status={session.phases[session.currentPhase]} />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{updatedAgo}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom two-column */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Review Queue */}
        <div className="bg-card border border-border rounded-md overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold text-foreground">Review Queue</span>
            <button onClick={() => setLocation('/reviews')} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-border">
            {reviewQueueStories.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-muted-foreground">No stories awaiting review</div>
            ) : (
              reviewQueueStories.map(story => (
                <div key={story.id} className="px-4 py-2.5 flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground w-16 flex-shrink-0">{story.id}</span>
                  <span className="flex-1 text-xs font-medium text-foreground truncate">{story.title}</span>
                  <ReviewStatusBadge status={story.reviewStatus} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Exports */}
        <div className="bg-card border border-border rounded-md overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold text-foreground">Recent Exports</span>
            <button onClick={() => setLocation('/exports')} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-border">
            {recentExports.map(pkg => (
              <div key={pkg.id} className="px-4 py-2.5 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-foreground truncate">{pkg.sessionName}</div>
                  <div className="text-xs text-muted-foreground">{pkg.epicCount} epics · {pkg.storyCount} stories · {pkg.date}</div>
                </div>
                <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded uppercase">{pkg.format}</span>
                <span className={cn('text-xs px-1.5 py-0.5 rounded',
                  pkg.status === 'complete' ? 'bg-[var(--color-success-soft)] text-[var(--color-success)]' :
                  pkg.status === 'partial' ? 'bg-[var(--color-warning-soft)] text-[var(--color-warning)]' :
                  'bg-muted text-muted-foreground'
                )}>
                  {pkg.status}
                </span>
              </div>
            ))}
            {recentExports.length === 0 && (
              <div className="px-4 py-6 text-center text-xs text-muted-foreground">No export packages yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
