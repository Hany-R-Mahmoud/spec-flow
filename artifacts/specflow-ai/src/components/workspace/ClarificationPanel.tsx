import { useState } from 'react';
import { ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';
import { ClarificationQuestion, GenerationStepState } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSessionStore } from '@/store/session-store';

interface ClarificationPanelProps {
  questions: ClarificationQuestion[];
  generationStep: GenerationStepState;
  onGenerateClarification: () => void;
  onGeneratePRD: () => void;
}

export function ClarificationPanel({
  questions,
  generationStep,
  onGenerateClarification,
  onGeneratePRD,
}: ClarificationPanelProps) {
  const { dispatch } = useSessionStore();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const firstGroup = questions[0]?.group;
    return firstGroup ? new Set([firstGroup]) : new Set();
  });

  const groups = Array.from(new Set(questions.map(q => q.group)));

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const requiredUnanswered = questions.filter(q => q.required && !q.answer && !q.skipped);
  const allRequiredAnswered = requiredUnanswered.length === 0;
  const isGenerating = generationStep.status === 'running';

  const handleAnswer = (id: string, answer: string) => {
    dispatch({ type: 'UPDATE_CLARIFICATION', payload: { id, answer } });
  };

  const handleSkip = (id: string) => {
    dispatch({ type: 'UPDATE_CLARIFICATION', payload: { id, answer: '', skipped: true } });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Clarification Questions</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Answer questions to generate accurate requirements. Required questions marked with
            <span className="text-[var(--color-danger)] ml-1">*</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onGenerateClarification}
            disabled={isGenerating}
            data-testid="button-generate-clarification"
          >
            {questions.length > 0 ? 'Regenerate Questions' : 'Generate Questions'}
          </Button>
          {!allRequiredAnswered && (
            <span className="text-xs text-[var(--color-danger)] flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {requiredUnanswered.length} required unanswered
            </span>
          )}
          <Button
            size="sm"
            onClick={onGeneratePRD}
            disabled={!allRequiredAnswered || isGenerating}
            data-testid="button-generate-prd"
          >
            Generate PRD
          </Button>
        </div>
      </div>

      {(generationStep.status !== 'idle' || generationStep.errorMessage) && (
        <div className="rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          {generationStep.status === 'running' && <span>Generating clarification questions…</span>}
          {generationStep.status === 'succeeded' && (
            <span>Clarification questions generated and saved.</span>
          )}
          {generationStep.status === 'failed' && (
            <span className="text-[var(--color-danger)]">{generationStep.errorMessage || 'Clarification generation failed. Retry when ready.'}</span>
          )}
          {generationStep.status === 'unavailable' && (
            <span className="text-[var(--color-warning)]">{generationStep.errorMessage || 'Clarification generation is unavailable right now.'}</span>
          )}
        </div>
      )}

      <div className="space-y-2">
        {groups.map(group => {
          const groupQuestions = questions.filter(q => q.group === group);
          const answeredCount = groupQuestions.filter(q => q.answer || q.skipped).length;
          const isExpanded = expandedGroups.has(group);

          return (
            <div key={group} className="border border-border rounded-md overflow-hidden">
              <button
                onClick={() => toggleGroup(group)}
                className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-muted transition-colors text-left"
                data-testid={`group-toggle-${group}`}
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  <span className="text-sm font-medium text-foreground">{group}</span>
                  <span className="text-xs px-1.5 py-0.5 bg-muted text-muted-foreground rounded">
                    {answeredCount}/{groupQuestions.length}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {groupQuestions.filter(q => q.required && !q.answer && !q.skipped).length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-[var(--color-danger)]" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="divide-y divide-border">
                  {groupQuestions.map(q => (
                    <div key={q.id} className="px-4 py-4 bg-card">
                      <div className="flex items-start gap-2 mb-2">
                        <p className="text-xs font-medium text-foreground flex-1">
                          {q.text}
                          {q.required && <span className="text-[var(--color-danger)] ml-1">*</span>}
                        </p>
                        {!q.required && !q.answer && !q.skipped && (
                          <button
                            onClick={() => handleSkip(q.id)}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap flex-shrink-0"
                          >
                            Skip with risk
                          </button>
                        )}
                      </div>

                      {q.skipped ? (
                        <div className="text-xs text-muted-foreground italic bg-muted px-3 py-2 rounded border border-border">
                          Skipped — may affect story quality
                        </div>
                      ) : (
                        <Textarea
                          value={q.answer}
                          onChange={(e) => handleAnswer(q.id, e.target.value)}
                          placeholder="Type your answer..."
                          className="text-xs min-h-[60px] resize-none"
                          data-testid={`clarification-answer-${q.id}`}
                        />
                      )}

                      {q.answer && (
                        <div className="mt-1 text-xs text-[var(--color-success)] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
                          Answered
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!allRequiredAnswered && (
        <div className="flex items-center gap-2 p-3 bg-[var(--color-warning-soft)] border border-yellow-200 rounded text-xs text-[var(--color-warning)]">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Answer all required questions before generating a PRD. Missing context will reduce story quality.</span>
        </div>
      )}
    </div>
  );
}
