import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type StepActionBarProps = {
  children: ReactNode;
  isLoading?: boolean;
  className?: string;
};

export function StepActionBar({ children, isLoading = false, className }: StepActionBarProps) {
  return (
    <div
      className={cn(
        'sticky bottom-0 z-10 -mx-0 border-t border-border bg-card/95 px-0 py-3 backdrop-blur supports-[backdrop-filter]:bg-card/80',
        isLoading && 'border-t-primary/40',
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-end gap-2 px-0 transition-opacity",
          isLoading && "opacity-50",
        )}
        aria-busy={isLoading}
      >
        {children}
      </div>
    </div>
  );
}
