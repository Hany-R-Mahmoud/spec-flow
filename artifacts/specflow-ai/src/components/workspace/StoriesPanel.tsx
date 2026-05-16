import { useState } from 'react';
import { ChevronDown, ChevronRight, Send, CheckCircle } from 'lucide-react';
import { Story, Epic, GenerationStepState } from '@/lib/types';
import { cn } from '@/lib/utils';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { ReviewStatusBadge } from '@/components/shared/StatusBadge';
import { ReadinessScoreRing } from '@/components/shared/ReadinessScore';
import { WarningList } from '@/components/shared/WarningBadge';
import { ScoreBar } from '@/components/shared/ScoreBar';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { StepActionBar } from '@/components/workspace/StepActionBar';

interface StoriesPanelProps {
  epics: Epic[];
  stories: Story[];
  onSendToReview: (storyId: string) => void;
  generationStep: GenerationStepState;
  onGenerateStories: () => void;
  onGenerateQuality: () => void;
  isAiBusy?: boolean;
  aiBusyLabel?: string;
}

function StoryCard({ story, onSendToReview }: { story: Story; onSendToReview: (storyId: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);

  return (
    <div className="border border-border rounded-md overflow-hidden" data-testid={`story-card-${story.id}`}>
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3 bg-card hover:bg-muted/50 transition-colors">
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-3 flex-1 text-left min-w-0">
          {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
          <span className="text-xs font-semibold text-muted-foreground font-mono flex-shrink-0">{story.id}</span>
          <span className="text-sm font-medium text-foreground truncate">{story.title}</span>
        </button>
        <div className="flex items-center gap-2 flex-shrink-0">
          <PriorityBadge priority={story.priority} />
          <ReadinessScoreRing score={story.readinessScore} size="sm" />
          <ReviewStatusBadge status={story.reviewStatus} />
          {story.warnings.length > 0 && (
            <span className="text-xs bg-[var(--color-warning-soft)] text-[var(--color-warning)] px-1.5 py-0.5 rounded border border-yellow-200">
              {story.warnings.length} warn
            </span>
          )}
        </div>
      </div>

      {/* User story summary (always visible) */}
      <div className="px-4 pb-2 bg-card border-t border-border/50">
        <p className="text-xs text-muted-foreground italic pt-2">{story.userStory}</p>
        {story.warnings.length > 0 && !expanded && (
          <div className="mt-2">
            <WarningList warnings={story.warnings} />
          </div>
        )}
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-border bg-card divide-y divide-border">
          {/* Score breakdown */}
          <div className="px-4 py-3">
            <button
              onClick={() => setShowScoreBreakdown(!showScoreBreakdown)}
              className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 hover:text-foreground transition-colors"
            >
              {showScoreBreakdown ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              Readiness Score Breakdown — {story.readinessScore.total}/100
              <span className={cn('ml-1 px-2 py-0.5 rounded text-xs font-medium not-uppercase',
                story.readinessScore.total >= 90 ? 'bg-[var(--color-success-soft)] text-[var(--color-success)]' :
                story.readinessScore.total >= 75 ? 'bg-[var(--color-primary-soft)] text-primary' :
                story.readinessScore.total >= 60 ? 'bg-[var(--color-warning-soft)] text-[var(--color-warning)]' :
                'bg-[var(--color-danger-soft)] text-[var(--color-danger)]'
              )}>
                {story.readinessScore.label}
              </span>
            </button>
            {showScoreBreakdown && (
              <div className="space-y-2 pl-5">
                <ScoreBar label="Clarity" value={story.readinessScore.clarity} max={20} />
                <ScoreBar label="Acceptance Criteria" value={story.readinessScore.acceptanceCriteria} max={20} />
                <ScoreBar label="Business Alignment" value={story.readinessScore.businessAlignment} max={15} />
                <ScoreBar label="Technical Feasibility" value={story.readinessScore.technicalFeasibility} max={15} />
                <ScoreBar label="Testability" value={story.readinessScore.testability} max={10} />
                <ScoreBar label="Edge Cases & Error Handling" value={story.readinessScore.edgeCasesErrorHandling} max={10} />
                <ScoreBar label="Deps / Design / L10n" value={story.readinessScore.dependenciesDesignLocalization} max={10} />
              </div>
            )}
          </div>

          {/* Warnings */}
          {story.warnings.length > 0 && (
            <div className="px-4 py-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Quality Warnings</div>
              <WarningList warnings={story.warnings} />
            </div>
          )}

          {/* Description */}
          <div className="px-4 py-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Description</div>
            <p className="text-xs text-foreground">{story.description}</p>
          </div>

          {/* Acceptance Criteria */}
          <div className="px-4 py-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Acceptance Criteria</div>
            <ol className="space-y-1.5">
              {story.acceptanceCriteria.map((ac, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                  <span className="w-4 h-4 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[10px] font-semibold flex-shrink-0 mt-0.5">{i + 1}</span>
                  {ac}
                </li>
              ))}
            </ol>
          </div>

          {/* Two-column: Edge Cases + Error Handling */}
          <div className="px-4 py-3 grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Edge Cases</div>
              <ul className="space-y-1">
                {story.edgeCases.map((ec, i) => (
                  <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                    <span className="text-muted-foreground mt-0.5">•</span>
                    {ec}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Error Handling</div>
              <p className="text-xs text-foreground">{story.errorHandling}</p>
            </div>
          </div>

          {/* Four-column: L10n, Design, Analytics, QA */}
          <div className="px-4 py-3 grid grid-cols-2 gap-4">
            {story.localizationNotes && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Localization</div>
                <p className="text-xs text-foreground">{story.localizationNotes}</p>
              </div>
            )}
            {story.designNotes && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Design / UX</div>
                <p className="text-xs text-foreground">{story.designNotes}</p>
              </div>
            )}
            {story.analyticsNotes && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Analytics</div>
                <p className="text-xs text-foreground font-mono">{story.analyticsNotes}</p>
              </div>
            )}
            {story.qaNotes && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">QA Notes</div>
                <p className="text-xs text-foreground">{story.qaNotes}</p>
              </div>
            )}
          </div>

          {/* Technical + Open Questions */}
          {(story.technicalNotes || story.openQuestions.length > 0) && (
            <div className="px-4 py-3 grid grid-cols-2 gap-4">
              {story.technicalNotes && (
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Technical Notes</div>
                  <p className="text-xs text-foreground font-mono">{story.technicalNotes}</p>
                </div>
              )}
              {story.openQuestions.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Open Questions</div>
                  <ul className="space-y-1">
                    {story.openQuestions.map((q, i) => (
                      <li key={i} className="text-xs text-[var(--color-warning)] flex items-start gap-1.5">
                        <span className="mt-0.5">?</span>
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Labels, Components, Dependencies */}
          <div className="px-4 py-3 flex items-center gap-6">
            {story.labels.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Labels:</span>
                {story.labels.map(l => <span key={l} className="text-xs bg-muted text-foreground px-1.5 py-0.5 rounded">{l}</span>)}
              </div>
            )}
            {story.components.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Components:</span>
                {story.components.map(c => <span key={c} className="text-xs bg-[var(--color-info-soft)] text-[var(--color-info)] px-1.5 py-0.5 rounded">{c}</span>)}
              </div>
            )}
            {story.dependencies.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Depends on:</span>
                {story.dependencies.map(d => <span key={d} className="text-xs text-primary font-mono">{d}</span>)}
              </div>
            )}
          </div>

          {/* Developer Review */}
          {story.developerReview && (
            <div className="px-4 py-3 bg-muted">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Developer Review</div>
              <div className="flex items-start gap-3">
                <ReviewStatusBadge status={story.developerReview.status} />
                <div className="flex-1">
                  <p className="text-xs text-foreground">{story.developerReview.comment}</p>
                  <p className="text-xs text-muted-foreground mt-1">{story.developerReview.reviewerName} · {new Date(story.developerReview.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="px-4 py-3 flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSendToReview(story.id)}
              className="text-xs"
              data-testid={`button-send-review-${story.id}`}
            >
              <Send className="w-3 h-3 mr-1" />
              Send to Dev Review
            </Button>
            {story.readinessScore.total >= 90 && (
              <span className="text-xs text-[var(--color-success)] flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                Ready for Jira
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function StoriesPanel({
  epics,
  stories,
  onSendToReview,
  generationStep,
  onGenerateStories,
  onGenerateQuality,
  isAiBusy = false,
  aiBusyLabel,
}: StoriesPanelProps) {
  const [collapsedEpics, setCollapsedEpics] = useState<Set<string>>(new Set());
  const isGenerating = generationStep.status === 'running' || isAiBusy;

  const toggleEpic = (epicId: string) => {
    setCollapsedEpics(prev => {
      const next = new Set(prev);
      if (next.has(epicId)) next.delete(epicId);
      else next.add(epicId);
      return next;
    });
  };

  const totalScore = stories.length > 0
    ? Math.round(stories.reduce((sum, s) => sum + s.readinessScore.total, 0) / stories.length)
    : 0;

  return (
    <div className="space-y-4">
      <div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">User Stories</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {stories.length} stories across {epics.length} epics · avg readiness {totalScore}/100
          </p>
        </div>
      </div>

      {(generationStep.status !== 'idle' || generationStep.errorMessage) && (
        <div className="rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          {generationStep.status === 'running' && <span>Generating stories…</span>}
          {generationStep.status === 'succeeded' && (
            <span>Stories generated and saved.</span>
          )}
          {generationStep.status === 'failed' && (
            <span className="text-[var(--color-danger)]">{generationStep.errorMessage || 'Story generation failed. Retry when ready.'}</span>
          )}
          {generationStep.status === 'unavailable' && (
            <span className="text-[var(--color-warning)]">{generationStep.errorMessage || 'Story generation is unavailable right now.'}</span>
          )}
        </div>
      )}

      <div className="space-y-6">
        {epics.map((epic, epicIdx) => {
          const epicStories = stories.filter(s => s.epicId === epic.id);
          const isCollapsed = collapsedEpics.has(epic.id);

          return (
            <div key={epic.id}>
              <button
                onClick={() => toggleEpic(epic.id)}
                className="flex items-center gap-2 mb-3 group w-full text-left"
                data-testid={`stories-epic-toggle-${epic.id}`}
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                <span className="text-xs font-semibold text-muted-foreground">EP-{epicIdx + 1}</span>
                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{epic.title}</span>
                <span className="text-xs text-muted-foreground">({epicStories.length} stories)</span>
                <PriorityBadge priority={epic.priority} />
              </button>

              {!isCollapsed && (
                <div className="space-y-2 pl-4 border-l-2 border-border">
                  {epicStories.length === 0 ? (
                    <p className="text-xs text-muted-foreground px-4 py-3">No stories for this epic yet.</p>
                  ) : (
                    epicStories.map((story) => (
                      <StoryCard key={story.id} story={story} onSendToReview={onSendToReview} />
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <StepActionBar isLoading={isGenerating} loadingLabel={aiBusyLabel ?? "Generating stories..."}>
        <Button size="sm" variant="outline" onClick={onGenerateStories} disabled={isGenerating || epics.length === 0}>
          {isGenerating ? <Spinner className="h-3.5 w-3.5" /> : null}
          Regenerate Stories
        </Button>
        <Button size="sm" onClick={onGenerateQuality} disabled={isGenerating || stories.length === 0} data-testid="button-review-quality">
          {isGenerating ? <Spinner className="h-3.5 w-3.5" /> : null}
          Review Quality
        </Button>
      </StepActionBar>
    </div>
  );
}
