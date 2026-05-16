import { AlertCircle, AlertTriangle, ArrowRight, CheckCircle } from 'lucide-react';
import { Phase, PhaseStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';

export interface GuidanceItem {
  type: 'error' | 'warning' | 'success' | 'action';
  message: string;
  action?: string;
  onAction?: () => void;
}

interface WorkflowStatusBarProps {
  phase: Phase;
  phaseStatus: PhaseStatus;
  items: GuidanceItem[];
  completionCount?: { done: number; total: number };
  isGenerating?: boolean;
  generatingLabel?: string;
}

export function WorkflowStatusBar({
  phase,
  phaseStatus,
  items,
  completionCount,
  isGenerating = false,
  generatingLabel,
}: WorkflowStatusBarProps) {
  const errors = items.filter(i => i.type === 'error');
  const warnings = items.filter(i => i.type === 'warning');
  const successes = items.filter(i => i.type === 'success');
  const actions = items.filter(i => i.type === 'action' && i.onAction);

  const hasIssues = errors.length > 0 || warnings.length > 0;

  return (
    <div className="rounded-md border border-border bg-card px-4 py-3">
      {/* Top row: phase status + progress + generating indicator */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className={cn('text-xs font-medium px-2 py-0.5 rounded',
          phaseStatus === 'complete' ? 'bg-[var(--color-success-soft)] text-[var(--color-success)]' :
          phaseStatus === 'in-progress' ? 'bg-[var(--color-primary-soft)] text-primary' :
          phaseStatus === 'needs-attention' ? 'bg-[var(--color-warning-soft)] text-[var(--color-warning)]' :
          'bg-muted text-muted-foreground'
        )}>
          {phaseStatus === 'complete' ? 'Complete' : phaseStatus === 'in-progress' ? 'In Progress' : phaseStatus === 'needs-attention' ? 'Needs Attention' : 'Not Started'}
        </span>

        {completionCount && completionCount.total > 0 && (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="h-1.5 flex-1 max-w-32 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(completionCount.done / completionCount.total) * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {completionCount.done}/{completionCount.total}
            </span>
          </div>
        )}

        {isGenerating && (
          <div className="flex items-center gap-1.5 ml-auto text-xs text-primary font-medium">
            <Spinner className="h-3 w-3" />
            <span>{generatingLabel ?? 'AI is working…'}</span>
          </div>
        )}
      </div>

      {/* Issues/successes row — only show if there are any */}
      {(hasIssues || successes.length > 0) && (
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          {errors.map((item, i) => (
            <span key={`e-${i}`} className="inline-flex items-center gap-1 text-xs text-[var(--color-danger)]">
              <AlertCircle className="w-3 h-3" />
              {item.message}
            </span>
          ))}
          {warnings.map((item, i) => (
            <span key={`w-${i}`} className="inline-flex items-center gap-1 text-xs text-[var(--color-warning)]">
              <AlertTriangle className="w-3 h-3" />
              {item.message}
            </span>
          ))}
          {successes.map((item, i) => (
            <span key={`s-${i}`} className="inline-flex items-center gap-1 text-xs text-[var(--color-success)]">
              <CheckCircle className="w-3 h-3" />
              {item.message}
            </span>
          ))}
        </div>
      )}

      {/* Action buttons row — only clickable actions */}
      {actions.length > 0 && (
        <div className="flex items-center gap-3 mt-2">
          {actions.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={item.onAction}
              className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
            >
              <ArrowRight className="w-3 h-3" />
              {item.message}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
