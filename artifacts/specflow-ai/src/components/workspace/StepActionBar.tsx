import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type StepActionBarProps = {
  children: ReactNode;
  className?: string;
};

export function StepActionBar({ children, className }: StepActionBarProps) {
  return (
    <div
      className={cn(
        'sticky bottom-0 z-10 -mx-0 border-t border-border bg-card/95 px-0 py-3 backdrop-blur supports-[backdrop-filter]:bg-card/80',
        className,
      )}
    >
      <div className="flex items-center justify-end gap-2 px-0">
        {children}
      </div>
    </div>
  );
}
