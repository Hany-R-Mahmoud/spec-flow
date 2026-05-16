import { useState } from 'react';
import { Story, Epic, GenerationStepState } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, CheckCircle, Scissors, Send } from 'lucide-react';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { WarningList } from '@/components/shared/WarningBadge';
import { ScoreBar } from '@/components/shared/ScoreBar';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import { useSessionStore } from '@/store/session-store';
import { StepActionBar } from '@/components/workspace/StepActionBar';

interface QualityReviewPanelProps {
  stories: Story[];
  epics: Epic[];
  generationStep: GenerationStepState;
  onGenerateQuality: () => void;
  onSendToDevReview: () => void;
  onSplitStory: (storyId: string) => void | Promise<void>;
  isAiBusy?: boolean;
}

function scoreColor(value: number) {
  if (value >= 90) return 'text-[var(--color-success)]';
  if (value >= 75) return 'text-primary';
  if (value >= 60) return 'text-[var(--color-warning)]';
  return 'text-[var(--color-danger)]';
}

export function QualityReviewPanel({
  stories,
  epics,
  generationStep,
  onGenerateQuality,
  onSendToDevReview,
  onSplitStory,
  isAiBusy = false,
}: QualityReviewPanelProps) {
  const { toast } = useToast();
  const { dispatch } = useSessionStore();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [splittingStoryId, setSplittingStoryId] = useState<string | null>(null);
  const isGenerating = generationStep.status === 'running' || isAiBusy;

  const avgScore = stories.length > 0
    ? Math.round(stories.reduce((sum, s) => sum + s.readinessScore.total, 0) / stories.length)
    : 0;

  const ready = stories.filter(s => s.readinessScore.total >= 90);
  const minor = stories.filter(s => s.readinessScore.total >= 75 && s.readinessScore.total < 90);
  const needs = stories.filter(s => s.readinessScore.total >= 60 && s.readinessScore.total < 75);
  const notReady = stories.filter(s => s.readinessScore.total < 60);

  const totalWarnings = stories.reduce((sum, s) => sum + s.warnings.length, 0);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const markReady = (story: Story) => {
    dispatch({ type: 'UPDATE_STORY', payload: { ...story, reviewStatus: 'approved' } });
    toast({ title: 'Marked ready', description: `${story.id} marked as ready for Jira.` });
  };

  const sendToReview = (story: Story) => {
    dispatch({
      type: 'UPDATE_STORY',
      payload: {
        ...story,
        reviewStatus: 'pending',
        developerReview: undefined,
      },
    });
    toast({ title: 'Returned to review queue', description: `${story.id} will be reviewed again.` });
  };

  const handleSplitStory = async (storyId: string) => {
    setSplittingStoryId(storyId);
    try {
      await onSplitStory(storyId);
    } finally {
      setSplittingStoryId((current) => (current === storyId ? null : current));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Quality Review</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {stories.length} stories · avg {avgScore}/100 · {totalWarnings} warnings
          </p>
        </div>
      </div>

      {(generationStep.status === 'succeeded' || generationStep.status === 'failed' || generationStep.status === 'unavailable' || generationStep.errorMessage) && (
        <div className="rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          {generationStep.status === 'succeeded' && (
            <span>Readiness scores refreshed from the API workflow.</span>
          )}
          {generationStep.status === 'failed' && (
            <span className="text-[var(--color-danger)]">{generationStep.errorMessage || 'Quality review failed. Retry when ready.'}</span>
          )}
          {generationStep.status === 'unavailable' && (
            <span className="text-[var(--color-warning)]">{generationStep.errorMessage || 'Quality review is unavailable right now.'}</span>
          )}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Ready for Jira', count: ready.length, color: 'var(--color-success)', bg: 'var(--color-success-soft)', range: '90-100' },
          { label: 'Minor Review', count: minor.length, color: 'hsl(var(--primary))', bg: 'var(--color-primary-soft)', range: '75-89' },
          { label: 'Needs Refinement', count: needs.length, color: 'var(--color-warning)', bg: 'var(--color-warning-soft)', range: '60-74' },
          { label: 'Not Ready', count: notReady.length, color: 'var(--color-danger)', bg: 'var(--color-danger-soft)', range: '<60' },
        ].map(({ label, count, color, bg, range }) => (
          <div key={label} className="border border-border rounded-md p-3" style={{ backgroundColor: `var(${bg.slice(4, -1)})` }}>
            <div className="text-2xl font-bold" style={{ color }}>{count}</div>
            <div className="text-xs font-medium text-foreground mt-0.5">{label}</div>
            <div className="text-xs text-muted-foreground">{range}</div>
          </div>
        ))}
      </div>

      {/* Per-story quality table */}
      <div className="border border-border rounded-md overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr_auto] bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide gap-2 border-b border-border">
          <div>Story</div>
          <div className="text-center">Score</div>
          <div className="text-center">Clarity</div>
          <div className="text-center">AC</div>
          <div className="text-center">Business</div>
          <div className="text-center">Feasibility</div>
          <div className="text-center">Warnings</div>
          <div>Actions</div>
        </div>

        <div className="divide-y divide-border">
          {stories.map(story => {
            const isExpanded = expandedRows.has(story.id);
            return (
              <div key={story.id}>
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr_auto] px-4 py-2.5 items-center gap-2 hover:bg-muted/40 transition-colors">
                  <button
                    onClick={() => toggleRow(story.id)}
                    className="flex items-center gap-2 text-left"
                  >
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
                    <span className="text-xs font-mono text-muted-foreground">{story.id}</span>
                    <span className="text-xs font-medium text-foreground truncate">{story.title}</span>
                    <PriorityBadge priority={story.priority} />
                  </button>

                  <div className="text-center">
                    <span className={cn('text-sm font-bold', scoreColor(story.readinessScore.total))}>
                      {story.readinessScore.total}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className={cn('text-xs font-medium', scoreColor(story.readinessScore.clarity * 5))}>
                      {story.readinessScore.clarity}/20
                    </span>
                  </div>
                  <div className="text-center">
                    <span className={cn('text-xs font-medium', scoreColor(story.readinessScore.acceptanceCriteria * 5))}>
                      {story.readinessScore.acceptanceCriteria}/20
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-muted-foreground">
                      {story.readinessScore.businessAlignment}/15
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-muted-foreground">
                      {story.readinessScore.technicalFeasibility}/15
                    </span>
                  </div>
                  <div className="text-center">
                    {story.warnings.length > 0 ? (
                      <span className="text-xs bg-[var(--color-warning-soft)] text-[var(--color-warning)] px-1.5 py-0.5 rounded border border-yellow-200">
                        {story.warnings.length}
                      </span>
                    ) : (
                      <CheckCircle className="w-4 h-4 text-[var(--color-success)] mx-auto" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => sendToReview(story)}
                      className="text-xs text-primary hover:text-primary/80 transition-colors whitespace-nowrap"
                      title="Send to Dev Review"
                    >
                      Review
                    </button>
                    <span className="text-muted-foreground">·</span>
                    <button
                      onClick={() => markReady(story)}
                      className="text-xs text-[var(--color-success)] hover:opacity-80 transition-opacity whitespace-nowrap"
                      title="Mark as Ready"
                    >
                      Ready
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 py-3 bg-muted border-t border-border space-y-3">
                    <div className="space-y-2">
                      <ScoreBar label="Clarity (20)" value={story.readinessScore.clarity} max={20} />
                      <ScoreBar label="Acceptance Criteria (20)" value={story.readinessScore.acceptanceCriteria} max={20} />
                      <ScoreBar label="Business Alignment (15)" value={story.readinessScore.businessAlignment} max={15} />
                      <ScoreBar label="Technical Feasibility (15)" value={story.readinessScore.technicalFeasibility} max={15} />
                      <ScoreBar label="Testability (10)" value={story.readinessScore.testability} max={10} />
                      <ScoreBar label="Edge Cases & Errors (10)" value={story.readinessScore.edgeCasesErrorHandling} max={10} />
                      <ScoreBar label="Deps / Design / L10n (10)" value={story.readinessScore.dependenciesDesignLocalization} max={10} />
                    </div>
                    {story.warnings.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-muted-foreground mb-1.5">Warnings</div>
                        <WarningList warnings={story.warnings} />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => sendToReview(story)}>
                        <Send className="w-3 h-3 mr-1" />
                        Send to Review
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                        onClick={() => void handleSplitStory(story.id)}
                        disabled={isGenerating || splittingStoryId === story.id}
                      >
                        <Scissors className="w-3 h-3 mr-1" />
                        {splittingStoryId === story.id ? 'Splitting…' : 'Split Story'}
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => markReady(story)}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Mark Ready
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <StepActionBar isLoading={isGenerating}>
        <Button size="sm" variant="outline" onClick={onGenerateQuality} disabled={isGenerating || stories.length === 0}>
          {isGenerating ? <Spinner className="h-3.5 w-3.5" /> : null}
          Refresh Scores
        </Button>
        <Button size="sm" onClick={onSendToDevReview} disabled={isGenerating || stories.length === 0} data-testid="button-send-all-review">
          {isGenerating ? <Spinner className="h-3.5 w-3.5" /> : null}
          <Send className="w-3 h-3 mr-1.5" />
          Send All to Dev Review
        </Button>
      </StepActionBar>
    </div>
  );
}
