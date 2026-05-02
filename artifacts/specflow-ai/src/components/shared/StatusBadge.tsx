import { cn } from '@/lib/utils';
import { CheckCircle, Clock, AlertTriangle, XCircle, HelpCircle, Shield, Maximize } from 'lucide-react';
import { ReviewStatus, PhaseStatus } from '@/lib/types';

interface ReviewStatusBadgeProps {
  status: ReviewStatus;
  className?: string;
}

const reviewConfig: Record<ReviewStatus, { label: string; icon: typeof CheckCircle; className: string }> = {
  approved: { label: 'Approved', icon: CheckCircle, className: 'bg-[var(--color-success-soft)] text-[var(--color-success)] border border-green-200' },
  pending: { label: 'Pending', icon: Clock, className: 'bg-muted text-muted-foreground border border-border' },
  'needs-clarification': { label: 'Needs Clarification', icon: HelpCircle, className: 'bg-[var(--color-warning-soft)] text-[var(--color-warning)] border border-yellow-200' },
  'too-large': { label: 'Too Large', icon: Maximize, className: 'bg-orange-50 text-orange-600 border border-orange-200' },
  'technically-risky': { label: 'Technically Risky', icon: Shield, className: 'bg-orange-50 text-orange-600 border border-orange-200' },
  blocked: { label: 'Blocked', icon: XCircle, className: 'bg-[var(--color-danger-soft)] text-[var(--color-danger)] border border-red-200' },
  'missing-ac': { label: 'Missing AC', icon: AlertTriangle, className: 'bg-[var(--color-warning-soft)] text-[var(--color-warning)] border border-yellow-200' },
};

export function ReviewStatusBadge({ status, className }: ReviewStatusBadgeProps) {
  const config = reviewConfig[status];
  const Icon = config.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium', config.className, className)}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

interface PhaseStatusBadgeProps {
  status: PhaseStatus;
  className?: string;
}

const phaseConfig: Record<PhaseStatus, { label: string; className: string }> = {
  'complete': { label: 'Complete', className: 'bg-[var(--color-success-soft)] text-[var(--color-success)] border border-green-200' },
  'in-progress': { label: 'In Progress', className: 'bg-[var(--color-primary-soft)] text-primary border border-blue-200' },
  'not-started': { label: 'Not Started', className: 'bg-muted text-muted-foreground border border-border' },
  'needs-attention': { label: 'Needs Attention', className: 'bg-[var(--color-warning-soft)] text-[var(--color-warning)] border border-yellow-200' },
};

export function PhaseStatusBadge({ status, className }: PhaseStatusBadgeProps) {
  const config = phaseConfig[status];
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', config.className, className)}>
      {config.label}
    </span>
  );
}
