import { cn } from "../../lib/utils";
import { Spinner } from "../ui/spinner";

interface AiLoadingStateProps {
  label: string;
  description?: string;
  compact?: boolean;
  className?: string;
}

export function AiLoadingState({
  label,
  description,
  compact = false,
  className,
}: AiLoadingStateProps) {
  return (
    <div
      aria-live="polite"
      className={cn(
        "overflow-hidden rounded-xl border border-primary/35 bg-primary/10 text-primary shadow-[0_0_32px_rgba(99,102,241,0.16)]",
        "motion-safe:animate-pulse",
        compact ? "px-3 py-2" : "px-4 py-3",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <Spinner
          className={cn(
            "shrink-0 text-primary",
            compact ? "h-4 w-4" : "h-5 w-5",
          )}
        />
        <div className="min-w-0">
          <p className={cn("font-medium", compact ? "text-sm" : "text-base")}>
            {label}
          </p>
          {description ? (
            <p
              className={cn(
                "mt-1 text-primary/80",
                compact ? "text-xs" : "text-sm",
              )}
            >
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {!compact ? (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-primary/15">
          <div className="h-full w-1/2 rounded-full bg-primary/70 motion-safe:animate-[ai-loading-slide_1.25s_ease-in-out_infinite]" />
        </div>
      ) : null}
    </div>
  );
}
