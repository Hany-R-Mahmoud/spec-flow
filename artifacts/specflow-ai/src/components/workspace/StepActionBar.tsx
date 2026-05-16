import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { AiLoadingState } from './AiLoadingState';

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
        <AiLoadingState
          compact
          className="mb-2 ml-auto max-w-md"
          label={loadingLabel ?? 'AI is working...'}
        />
      ) : null}
      <div
        className={cn(
          "flex items-center justify-end gap-2 px-0 transition-opacity",
          isLoading && "opacity-85",
        )}
        aria-busy={isLoading}
      >
        {children}
      </div>
    </div>
  );
}
