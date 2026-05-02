import { cn } from '@/lib/utils';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { QualityWarning } from '@/lib/types';

interface WarningBadgeProps {
  warning: QualityWarning;
  className?: string;
}

const severityConfig = {
  error: { icon: AlertCircle, className: 'bg-[var(--color-danger-soft)] text-[var(--color-danger)] border border-red-200' },
  warning: { icon: AlertTriangle, className: 'bg-[var(--color-warning-soft)] text-[var(--color-warning)] border border-yellow-200' },
  info: { icon: Info, className: 'bg-[var(--color-info-soft)] text-[var(--color-info)] border border-cyan-200' },
};

export function WarningBadge({ warning, className }: WarningBadgeProps) {
  const config = severityConfig[warning.severity];
  const Icon = config.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium', config.className, className)}>
      <Icon className="w-3 h-3 flex-shrink-0" />
      {warning.message}
    </span>
  );
}

interface WarningListProps {
  warnings: QualityWarning[];
  className?: string;
}

export function WarningList({ warnings, className }: WarningListProps) {
  if (warnings.length === 0) return null;
  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {warnings.map((w) => (
        <WarningBadge key={w.id} warning={w} />
      ))}
    </div>
  );
}
