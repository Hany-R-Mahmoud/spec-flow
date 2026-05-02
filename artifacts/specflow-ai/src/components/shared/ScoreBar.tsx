import { cn } from '@/lib/utils';

interface ScoreBarProps {
  label: string;
  value: number;
  max?: number;
  className?: string;
}

function getScoreColor(value: number, max: number) {
  const pct = (value / max) * 100;
  if (pct >= 90) return 'bg-[var(--color-success)]';
  if (pct >= 75) return 'bg-primary';
  if (pct >= 60) return 'bg-[var(--color-warning)]';
  return 'bg-[var(--color-danger)]';
}

export function ScoreBar({ label, value, max = 20, className }: ScoreBarProps) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="text-xs text-muted-foreground w-40 flex-shrink-0 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', getScoreColor(value, max))}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium text-foreground w-8 text-right flex-shrink-0">{value}/{max}</span>
    </div>
  );
}
