import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import { GenerationStepState } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

type GenerationStatusNoticeProps = {
  generationStep: GenerationStepState;
  stepLabel: string;
  successMessage: string;
  failedMessage: string;
  unavailableMessage: string;
  onRetry: () => void;
  retryLabel: string;
  onCancel?: () => void;
};

function ElapsedTimer({ startedAt }: { startedAt: string | null }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const base = startedAt ? Date.now() - new Date(startedAt).getTime() : 0;
    setElapsed(Math.floor(base / 1000));

    const id = setInterval(() => {
      const now = startedAt ? Date.now() - new Date(startedAt).getTime() : 0;
      setElapsed(Math.floor(now / 1000));
    }, 1000);

    return () => clearInterval(id);
  }, [startedAt]);

  if (elapsed < 10) return null;
  return <span className="text-muted-foreground">Running for {elapsed}s…</span>;
}

export function GenerationStatusNotice({
  generationStep,
  stepLabel,
  successMessage,
  failedMessage,
  unavailableMessage,
  onRetry,
  retryLabel,
  onCancel,
}: GenerationStatusNoticeProps) {
  const { status, errorMessage, updatedAt } = generationStep;

  if (status === 'running') {
    return (
      <div
        className="rounded-md border border-primary/30 bg-[var(--color-primary-soft)] px-3 py-2.5 text-xs"
        role="status"
        aria-live="polite"
        aria-label={`Generating ${stepLabel}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-primary font-medium">
            <Spinner className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Generating {stepLabel}…</span>
            <ElapsedTimer startedAt={updatedAt} />
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
              aria-label="Cancel generation"
            >
              <X className="h-3 w-3" />
              Cancel
            </button>
          )}
        </div>
        {/* Indeterminate progress bar */}
        <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-primary/20">
          <div className="h-full w-1/3 rounded-full bg-primary animate-[ai-loading-slide_1.8s_ease-in-out_infinite]" />
        </div>
        <p className="mt-1.5 text-muted-foreground">
          This usually takes 10–30 seconds.
        </p>
      </div>
    );
  }

  const isVisible =
    status === 'succeeded' || status === 'failed' || status === 'unavailable' || Boolean(errorMessage);

  if (!isVisible) {
    return null;
  }

  const message =
    status === 'succeeded'
      ? successMessage
      : status === 'failed'
        ? errorMessage || failedMessage
        : errorMessage || unavailableMessage;

  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          {status === 'succeeded' ? (
            <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-[var(--color-success)]" />
          ) : (
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 text-[var(--color-warning)]" />
          )}
          <span className={status === 'failed' ? 'text-[var(--color-danger)]' : 'text-muted-foreground'}>
            {message}
          </span>
        </div>

        {status === 'failed' ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onRetry}
            className="h-7 shrink-0 text-xs"
          >
            Retry {retryLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
