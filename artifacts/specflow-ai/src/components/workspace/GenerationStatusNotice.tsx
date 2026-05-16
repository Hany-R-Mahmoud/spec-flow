import { AlertTriangle, CheckCircle } from 'lucide-react';
import { GenerationStepState } from '@/lib/types';
import { Button } from '@/components/ui/button';

type GenerationStatusNoticeProps = {
  generationStep: GenerationStepState;
  successMessage: string;
  failedMessage: string;
  unavailableMessage: string;
  onRetry: () => void;
  retryLabel: string;
};

export function GenerationStatusNotice({
  generationStep,
  successMessage,
  failedMessage,
  unavailableMessage,
  onRetry,
  retryLabel,
}: GenerationStatusNoticeProps) {
  const { status, errorMessage } = generationStep;
  const isVisible = status === 'succeeded' || status === 'failed' || status === 'unavailable' || Boolean(errorMessage);

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
