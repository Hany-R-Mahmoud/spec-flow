import type { ReactNode } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

type StepActionBarProps = {
  children: ReactNode;
  isLoading?: boolean;
  loadingLabel?: string;
  className?: string;
};

export function StepActionBar({ children, isLoading = false, loadingLabel, className }: StepActionBarProps) {
  return (
    <div
      className={cn(
        'sticky bottom-0 z-10 -mx-0 border-t border-border bg-card/95 px-0 py-3 backdrop-blur supports-[backdrop-filter]:bg-card/80',
        className,
      )}
    >
      {isLoading ? (
        <div className="mb-2 flex items-center justify-end gap-2 px-0 text-xs text-muted-foreground">
          <Spinner className="h-3.5 w-3.5" />
          <span>{loadingLabel ?? 'AI is working…'}</span>
        </div>
      ) : null}
      <div className="flex items-center justify-end gap-2 px-0" aria-busy={isLoading}>
        {children}
      </div>
    </div>
  );
}
