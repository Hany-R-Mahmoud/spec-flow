import { cn } from '@/lib/utils';
import { Check, AlertTriangle } from 'lucide-react';
import { Phase, PhaseStatus, ProjectSession } from '@/lib/types';

const PHASES: { key: Phase; label: string; short: string }[] = [
  { key: 'intake', label: 'Intake', short: 'Intake' },
  { key: 'clarification', label: 'Clarification', short: 'Clarify' },
  { key: 'prd', label: 'PRD', short: 'PRD' },
  { key: 'epics', label: 'Epics', short: 'Epics' },
  { key: 'stories', label: 'Stories', short: 'Stories' },
  { key: 'quality', label: 'Quality Review', short: 'Quality' },
  { key: 'devReview', label: 'Dev Review', short: 'Dev' },
  { key: 'export', label: 'Jira Export', short: 'Export' },
];

const PHASE_ORDER: Phase[] = ['intake', 'clarification', 'prd', 'epics', 'stories', 'quality', 'devReview', 'export'];

function isAccessible(phase: Phase, session: ProjectSession): boolean {
  const phaseIdx = PHASE_ORDER.indexOf(phase);
  const currentIdx = PHASE_ORDER.indexOf(session.currentPhase);
  return phaseIdx <= currentIdx + 1;
}

interface PhaseTrackerProps {
  session: ProjectSession;
  activePhase: Phase;
  onPhaseClick: (phase: Phase) => void;
}

export function PhaseTracker({ session, activePhase, onPhaseClick }: PhaseTrackerProps) {
  return (
    <div className="border-b border-border bg-card">
      <div className="overflow-x-auto">
        <div className="flex items-stretch min-w-max px-4">
          {PHASES.map((phase, idx) => {
            const status: PhaseStatus = session.phases[phase.key];
            const isActive = activePhase === phase.key;
            const accessible = isAccessible(phase.key, session);

            return (
              <div key={phase.key} className="flex items-center">
                {idx > 0 && (
                  <div className={cn('w-6 h-px', status === 'complete' ? 'bg-[var(--color-success)]' : 'bg-border')} />
                )}
                <button
                  onClick={() => accessible && onPhaseClick(phase.key)}
                  disabled={!accessible}
                  data-testid={`phase-tab-${phase.key}`}
                  className={cn(
                    'flex items-center gap-2 px-3 py-3 text-xs font-medium transition-colors border-b-2 relative whitespace-nowrap',
                    isActive
                      ? 'border-primary text-primary'
                      : status === 'complete'
                      ? 'border-transparent text-[var(--color-success)] hover:text-[var(--color-success)]'
                      : status === 'needs-attention'
                      ? 'border-transparent text-[var(--color-warning)] hover:text-[var(--color-warning)]'
                      : status === 'in-progress'
                      ? 'border-transparent text-foreground hover:text-primary'
                      : 'border-transparent text-muted-foreground',
                    !accessible && 'cursor-not-allowed opacity-50',
                    accessible && !isActive && 'hover:bg-muted cursor-pointer'
                  )}
                >
                  {status === 'complete' ? (
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[var(--color-success)] text-white flex-shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  ) : status === 'needs-attention' ? (
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[var(--color-warning-soft)] flex-shrink-0">
                      <AlertTriangle className="w-2.5 h-2.5 text-[var(--color-warning)]" />
                    </span>
                  ) : status === 'in-progress' ? (
                    <span className={cn('flex items-center justify-center w-4 h-4 rounded-full flex-shrink-0 text-xs font-bold',
                      isActive ? 'bg-primary text-white' : 'bg-muted text-foreground border border-border'
                    )}>
                      {idx + 1}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-muted text-muted-foreground flex-shrink-0 text-xs font-bold border border-border">
                      {idx + 1}
                    </span>
                  )}
                  <span className="hidden sm:inline">{phase.label}</span>
                  <span className="sm:hidden">{phase.short}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
