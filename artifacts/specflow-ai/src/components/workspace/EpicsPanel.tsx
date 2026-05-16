import { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, ArrowRight } from 'lucide-react';
import { Epic, GenerationStepState } from '@/lib/types';
import { cn } from '@/lib/utils';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { StepActionBar } from '@/components/workspace/StepActionBar';
import { GenerationStatusNotice } from '@/components/workspace/GenerationStatusNotice';

interface EpicsPanelProps {
  epics: Epic[];
  generationStep: GenerationStepState;
  onGenerateEpics: () => void;
  onGenerateStories: () => void;
  isAiBusy?: boolean;
  onCancel?: () => void;
}

export function EpicsPanel({
  epics,
  generationStep,
  onGenerateEpics,
  onGenerateStories,
  isAiBusy = false,
  onCancel,
}: EpicsPanelProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['epic-1']));
  const { toast } = useToast();
  const isGenerating = generationStep.status === 'running' || isAiBusy;

  const toggle = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyEpic = (epic: Epic) => {
    navigator.clipboard.writeText(epic.jiraEpicDescription);
    toast({ title: 'Copied', description: `Epic description for "${epic.title}" copied to clipboard.` });
  };

  return (
    <div className="space-y-4">
      <div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Epics</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{epics.length} epics mapped to business goals</p>
        </div>
      </div>

      <GenerationStatusNotice
        generationStep={generationStep}
        stepLabel="epics"
        successMessage="Epics generated and saved."
        failedMessage="Epic generation failed. Retry when ready."
        unavailableMessage="Epic generation is unavailable right now."
        onRetry={onGenerateEpics}
        retryLabel="Epics"
        onCancel={onCancel}
      />

      <div className="space-y-3">
        {epics.map((epic, idx) => {
          const isExpanded = expandedIds.has(epic.id);
          return (
            <div key={epic.id} className="border border-border rounded-md overflow-hidden">
              <button
                onClick={() => toggle(epic.id)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-card hover:bg-muted transition-colors text-left"
                data-testid={`epic-toggle-${epic.id}`}
              >
                <span className="text-xs font-semibold text-muted-foreground w-8 flex-shrink-0">
                  EP-{idx + 1}
                </span>
                {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                <span className="flex-1 text-sm font-medium text-foreground">{epic.title}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <PriorityBadge priority={epic.priority} />
                  <span className="text-xs text-muted-foreground">{epic.storyCount} stories</span>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border bg-card divide-y divide-border">
                  <div className="px-4 py-3 grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Business Objective</div>
                      <p className="text-xs text-foreground">{epic.businessObjective}</p>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Scope Summary</div>
                      <p className="text-xs text-foreground">{epic.scopeSummary}</p>
                    </div>
                  </div>

                  <div className="px-4 py-3 grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">PRD Requirements</div>
                      <div className="flex flex-wrap gap-1">
                        {epic.prdRequirements.map(req => (
                          <span key={req} className="text-xs bg-[var(--color-primary-soft)] text-primary px-1.5 py-0.5 rounded font-mono">{req}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Dependencies</div>
                      <div className="space-y-0.5">
                        {epic.dependencies.length === 0 ? (
                          <span className="text-xs text-muted-foreground">None</span>
                        ) : epic.dependencies.map((dep, i) => (
                          <div key={i} className="text-xs text-foreground flex items-center gap-1">
                            <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                            {dep}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Risks</div>
                      <div className="space-y-0.5">
                        {epic.risks.map((risk, i) => (
                          <div key={i} className="text-xs text-[var(--color-warning)]">{risk}</div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Jira Epic Description</div>
                      <button
                        onClick={() => copyEpic(epic)}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                        data-testid={`button-copy-epic-${epic.id}`}
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                    </div>
                    <pre className="text-xs text-foreground bg-muted px-3 py-2 rounded whitespace-pre-wrap font-sans">
                      {epic.jiraEpicDescription}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <StepActionBar isLoading={isGenerating}>
        <Button size="sm" variant="outline" onClick={onGenerateEpics} disabled={isGenerating} loading={isGenerating}>
          {isGenerating ? 'Regenerating…' : 'Regenerate Epics'}
        </Button>
        <Button size="sm" onClick={onGenerateStories} disabled={isGenerating || epics.length === 0} loading={isGenerating} data-testid="button-generate-stories">
          {isGenerating ? 'Generating Stories…' : 'Generate Stories'}
        </Button>
      </StepActionBar>
    </div>
  );
}
