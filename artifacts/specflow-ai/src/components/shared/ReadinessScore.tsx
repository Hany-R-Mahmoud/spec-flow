import { cn } from '@/lib/utils';
import { ReadinessScore as ReadinessScoreType } from '@/lib/types';

interface ReadinessScoreProps {
  score: ReadinessScoreType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

function getScoreColor(total: number): string {
  if (total >= 90) return '#16A34A';
  if (total >= 75) return '#2F5BFF';
  if (total >= 60) return '#D97706';
  return '#DC2626';
}

function getLabelColor(total: number): string {
  if (total >= 90) return 'text-[var(--color-success)]';
  if (total >= 75) return 'text-primary';
  if (total >= 60) return 'text-[var(--color-warning)]';
  return 'text-[var(--color-danger)]';
}

const sizes = {
  sm: { size: 36, stroke: 3, fontSize: 'text-[10px]' },
  md: { size: 48, stroke: 4, fontSize: 'text-xs' },
  lg: { size: 64, stroke: 5, fontSize: 'text-sm' },
};

export function ReadinessScoreRing({ score, size = 'md', showLabel = false, className }: ReadinessScoreProps) {
  const { size: diameter, stroke, fontSize } = sizes[size];
  const radius = (diameter - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score.total / 100) * circumference;
  const color = getScoreColor(score.total);

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div style={{ width: diameter, height: diameter }} className="relative flex-shrink-0">
        <svg width={diameter} height={diameter} className="-rotate-90">
          <circle
            cx={diameter / 2}
            cy={diameter / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={stroke}
          />
          <circle
            cx={diameter / 2}
            cy={diameter / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${progress} ${circumference}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('font-semibold', fontSize)} style={{ color }}>
            {score.total}
          </span>
        </div>
      </div>
      {showLabel && (
        <span className={cn('text-xs font-medium', getLabelColor(score.total))}>
          {score.label}
        </span>
      )}
    </div>
  );
}

export function ReadinessScoreBadge({ score, className }: { score: ReadinessScoreType; className?: string }) {
  const color = getScoreColor(score.total);
  const bg = score.total >= 90 ? 'var(--color-success-soft)' : score.total >= 75 ? 'var(--color-primary-soft)' : score.total >= 60 ? 'var(--color-warning-soft)' : 'var(--color-danger-soft)';
  return (
    <span
      className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold', className)}
      style={{ backgroundColor: `var(${bg.slice(4, -1)})`, color }}
    >
      {score.total}/100
    </span>
  );
}
