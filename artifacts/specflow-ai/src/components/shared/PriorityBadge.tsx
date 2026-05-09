import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  className?: string;
}

const priorityConfig = {
  P0: { label: 'P0', className: 'bg-[var(--color-danger-soft)] text-[var(--color-danger)] border border-border/50' },
  P1: { label: 'P1', className: 'bg-orange-50 text-orange-600 border border-border/50 dark:bg-orange-950/30 dark:text-orange-300' },
  P2: { label: 'P2', className: 'bg-[var(--color-warning-soft)] text-[var(--color-warning)] border border-border/50' },
  P3: { label: 'P3', className: 'bg-muted text-muted-foreground border border-border' },
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  return (
    <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold font-mono', config.className, className)}>
      {config.label}
    </span>
  );
}
