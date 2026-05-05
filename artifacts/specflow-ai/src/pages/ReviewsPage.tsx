import { useState } from 'react';
import { useSessionStore } from '@/store/session-store';
import { ReviewStatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { cn } from '@/lib/utils';
import { Filter } from 'lucide-react';
import { ReviewStatus } from '@/lib/types';

const ALL_STATUSES: ReviewStatus[] = ['pending', 'approved', 'needs-clarification', 'too-large', 'technically-risky', 'blocked', 'missing-ac'];

export function ReviewsPage() {
  const { state } = useSessionStore();
  const [filterStatus, setFilterStatus] = useState<ReviewStatus | 'all'>('all');
  const [filterSession, setFilterSession] = useState('all');
  const [sortBy, setSortBy] = useState<'updated' | 'score' | 'priority'>('updated');

  const storiesWithContext = state.stories.map(story => {
    const session = state.sessions.find(s => s.id === story.sessionId);
    return { story, session };
  });

  const filtered = storiesWithContext
    .filter(({ story }) => filterStatus === 'all' || story.reviewStatus === filterStatus)
    .filter(({ story }) => filterSession === 'all' || story.sessionId === filterSession);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'score') return b.story.readinessScore.total - a.story.readinessScore.total;
    if (sortBy === 'priority') {
      const order = { P0: 0, P1: 1, P2: 2, P3: 3 };
      return order[a.story.priority] - order[b.story.priority];
    }
    return 0;
  });

  const statusCounts = ALL_STATUSES.map(s => ({
    status: s,
    count: state.stories.filter(story => story.reviewStatus === s).length,
  })).filter(s => s.count > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Reviews</h1>
        <p className="text-xs text-muted-foreground mt-0.5">All stories awaiting or completed developer review</p>
      </div>

      {/* Status summary */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterStatus('all')}
          className={cn('text-xs px-3 py-1.5 rounded border transition-colors',
            filterStatus === 'all' ? 'border-primary bg-[var(--color-primary-soft)] text-primary' : 'border-border bg-card text-muted-foreground hover:bg-muted'
          )}
        >
          All ({state.stories.length})
        </button>
        {statusCounts.map(({ status, count }) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={cn('text-xs px-3 py-1.5 rounded border transition-colors',
              filterStatus === status ? 'border-primary bg-[var(--color-primary-soft)] text-primary' : 'border-border bg-card text-muted-foreground hover:bg-muted'
            )}
          >
            {status.replace(/-/g, ' ')} ({count})
          </button>
        ))}
      </div>

      {/* Filters + Sort */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Filter className="w-3.5 h-3.5" />
          <span>Project:</span>
        </div>
        <select
          value={filterSession}
          onChange={e => setFilterSession(e.target.value)}
          className="text-xs h-7 px-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Projects</option>
          {state.sessions.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <div className="flex items-center gap-2 text-xs text-muted-foreground ml-4">
          <span>Sort by:</span>
        </div>
        {(['updated', 'score', 'priority'] as const).map(s => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            className={cn('text-xs px-2 py-1 rounded transition-colors capitalize',
              sortBy === s ? 'bg-muted text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-md overflow-hidden">
        <table className="w-full" aria-label="Developer review stories">
          <caption className="sr-only">Stories with project, priority, readiness, reviewer status, comment, and last updated time.</caption>
          <thead>
            <tr className="bg-muted border-b border-border">
              {['Story', 'Project / Session', 'Priority', 'Readiness', 'Reviewer Status', 'Comment', 'Updated'].map(h => (
                <th key={h} scope="col" className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.map(({ story, session }) => {
              const updatedLabels: Record<string, string> = {
                'session-1': '2h ago', 'session-2': '5h ago', 'session-3': '1d ago', 'session-4': '2d ago'
              };
              return (
                <tr key={story.id} className="hover:bg-muted/40 transition-colors" data-testid={`review-row-${story.id}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">{story.id}</span>
                      <span className="text-xs font-medium text-foreground">{story.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs font-medium text-foreground">{session?.name || 'Unknown'}</div>
                    <div className="text-xs text-muted-foreground font-mono">{session?.jiraKey}</div>
                  </td>
                  <td className="px-4 py-3"><PriorityBadge priority={story.priority} /></td>
                  <td className="px-4 py-3">
                    <span className={cn('text-sm font-bold',
                      story.readinessScore.total >= 90 ? 'text-[var(--color-success)]' :
                      story.readinessScore.total >= 75 ? 'text-primary' :
                      story.readinessScore.total >= 60 ? 'text-[var(--color-warning)]' : 'text-[var(--color-danger)]'
                    )}>
                      {story.readinessScore.total}
                    </span>
                    <span className="text-xs text-muted-foreground">/100</span>
                  </td>
                  <td className="px-4 py-3"><ReviewStatusBadge status={story.reviewStatus} /></td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <p className="text-xs text-muted-foreground truncate">
                      {story.developerReview?.comment || '—'}
                    </p>
                    {story.developerReview?.reviewerName && (
                      <p className="text-xs text-muted-foreground/60">{story.developerReview.reviewerName}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {updatedLabels[story.sessionId] || '3h ago'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {sorted.length === 0 && (
          <div className="px-4 py-12 text-center text-xs text-muted-foreground">
            {state.stories.length === 0
              ? 'No review items yet. Generate stories and send them to developer review to populate this queue.'
              : 'No stories match the selected filters. Change the project or status filters to widen the queue.'}
          </div>
        )}
      </div>
    </div>
  );
}
