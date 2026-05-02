import { AlertCircle, AlertTriangle, ArrowRight, CheckCircle, Lightbulb } from 'lucide-react';
import { Phase, PhaseStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface GuidanceItem {
  type: 'error' | 'warning' | 'success' | 'action';
  message: string;
  action?: string;
  onAction?: () => void;
}

interface GuidancePanelProps {
  phase: Phase;
  phaseStatus: PhaseStatus;
  items: GuidanceItem[];
  readinessLabel?: string;
  completionCount?: { done: number; total: number };
  className?: string;
}

const phaseDescriptions: Record<Phase, string> = {
  intake: 'Provide product input and configure breakdown settings.',
  clarification: 'Answer questions to help generate accurate requirements.',
  prd: 'Review and complete the generated PRD sections.',
  epics: 'Review epics mapped to your business goals.',
  stories: 'Review and refine generated user stories.',
  quality: 'Check readiness scores and resolve quality warnings.',
  devReview: 'Collect developer feedback on story quality.',
  export: 'Copy or download Jira-ready output.',
};

export function GuidancePanel({ phase, phaseStatus, items, readinessLabel, completionCount, className }: GuidancePanelProps) {
  const errors = items.filter(i => i.type === 'error');
  const warnings = items.filter(i => i.type === 'warning');
  const actions = items.filter(i => i.type === 'action');
  const successes = items.filter(i => i.type === 'success');

  return (
    <div className={cn('flex flex-col h-full border-l border-border bg-card', className)}>
      <div className="px-4 py-3 border-b border-border">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">AI Guidance</div>
        <div className="text-xs text-secondary-foreground">{phaseDescriptions[phase]}</div>
      </div>

      {/* Phase status */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-foreground">Phase Status</span>
          <span className={cn('text-xs font-medium px-2 py-0.5 rounded',
            phaseStatus === 'complete' ? 'bg-[var(--color-success-soft)] text-[var(--color-success)]' :
            phaseStatus === 'in-progress' ? 'bg-[var(--color-primary-soft)] text-primary' :
            phaseStatus === 'needs-attention' ? 'bg-[var(--color-warning-soft)] text-[var(--color-warning)]' :
            'bg-muted text-muted-foreground'
          )}>
            {phaseStatus === 'complete' ? 'Complete' : phaseStatus === 'in-progress' ? 'In Progress' : phaseStatus === 'needs-attention' ? 'Needs Attention' : 'Not Started'}
          </span>
        </div>
        {completionCount && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{completionCount.done}/{completionCount.total} complete</span>
              <span>{Math.round((completionCount.done / completionCount.total) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(completionCount.done / completionCount.total) * 100}%` }}
              />
            </div>
          </div>
        )}
        {readinessLabel && (
          <div className="text-xs text-muted-foreground mt-1">{readinessLabel}</div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Errors */}
        {errors.length > 0 && (
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-1.5 mb-2">
              <AlertCircle className="w-3.5 h-3.5 text-[var(--color-danger)]" />
              <span className="text-xs font-semibold text-[var(--color-danger)]">Issues ({errors.length})</span>
            </div>
            <div className="space-y-2">
              {errors.map((item, i) => (
                <div key={i} className="text-xs text-foreground bg-[var(--color-danger-soft)] px-3 py-2 rounded border border-red-100">
                  {item.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-[var(--color-warning)]" />
              <span className="text-xs font-semibold text-[var(--color-warning)]">Warnings ({warnings.length})</span>
            </div>
            <div className="space-y-2">
              {warnings.map((item, i) => (
                <div key={i} className="text-xs text-foreground bg-[var(--color-warning-soft)] px-3 py-2 rounded border border-yellow-100">
                  {item.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Successes */}
        {successes.length > 0 && (
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-1.5 mb-2">
              <CheckCircle className="w-3.5 h-3.5 text-[var(--color-success)]" />
              <span className="text-xs font-semibold text-[var(--color-success)]">Ready</span>
            </div>
            <div className="space-y-2">
              {successes.map((item, i) => (
                <div key={i} className="text-xs text-foreground bg-[var(--color-success-soft)] px-3 py-2 rounded border border-green-100">
                  {item.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Actions */}
        {actions.length > 0 && (
          <div className="px-4 py-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Lightbulb className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground">Suggested Actions</span>
            </div>
            <div className="space-y-1">
              {actions.map((item, i) => (
                <button
                  key={i}
                  onClick={item.onAction}
                  className="w-full text-left flex items-center gap-2 text-xs text-primary hover:text-primary/80 py-1.5 group transition-colors"
                >
                  <ArrowRight className="w-3 h-3 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  {item.message}
                </button>
              ))}
            </div>
          </div>
        )}

        {errors.length === 0 && warnings.length === 0 && actions.length === 0 && successes.length === 0 && (
          <div className="px-4 py-6 text-center">
            <CheckCircle className="w-8 h-8 text-[var(--color-success)] mx-auto mb-2" />
            <div className="text-xs text-muted-foreground">No issues detected for this phase.</div>
          </div>
        )}
      </div>
    </div>
  );
}
