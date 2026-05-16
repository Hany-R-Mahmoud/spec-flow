import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';
import { ClarificationQuestion, GenerationStepState } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import { useSessionStore } from '@/store/session-store';
import { StepActionBar } from '@/components/workspace/StepActionBar';

interface ClarificationPanelProps {
  questions: ClarificationQuestion[];
  generationStep: GenerationStepState;
  onGenerateClarification: () => void;
  onGeneratePRD: () => void;
  isAiBusy?: boolean;
}

type ClarificationFormValues = {
  questions: Array<{
    id: string;
    answer: string;
    skipped: boolean;
  }>;
};

export function ClarificationPanel({
  questions,
  generationStep,
  onGenerateClarification,
  onGeneratePRD,
  isAiBusy = false,
}: ClarificationPanelProps) {
  const { saveClarificationQuestions } = useSessionStore();
  const { toast } = useToast();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const firstGroup = questions[0]?.group;
    return firstGroup ? new Set([firstGroup]) : new Set();
  });

  const form = useForm<ClarificationFormValues>({
    defaultValues: {
      questions: questions.map((question) => ({
        id: question.id,
        answer: question.answer ?? '',
        skipped: question.skipped ?? false,
      })),
    },
  });

  useEffect(() => {
    form.reset({
      questions: questions.map((question) => ({
        id: question.id,
        answer: question.answer ?? '',
        skipped: question.skipped ?? false,
      })),
    });

    const firstGroup = questions[0]?.group;
    setExpandedGroups(firstGroup ? new Set([firstGroup]) : new Set());
  }, [form, questions]);

  const watchedQuestions = useWatch({ control: form.control, name: 'questions' }) ?? [];

  const groupedQuestions = useMemo(() => {
    return Array.from(new Set(questions.map((question) => question.group)));
  }, [questions]);

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  const requiredUnanswered = questions.filter((question, index) => {
    const draft = watchedQuestions[index];
    return question.required && !(draft?.answer?.trim()) && !draft?.skipped;
  });
  const allRequiredAnswered = requiredUnanswered.length === 0;
  const isGenerating = generationStep.status === 'running' || isAiBusy;

  const saveDraft = form.handleSubmit(async (values) => {
    const nextQuestions = questions.map((question, index) => ({
      ...question,
      answer: values.questions[index]?.answer ?? '',
      skipped: values.questions[index]?.skipped ?? false,
    }));

    const savedSession = await saveClarificationQuestions(nextQuestions);
    if (!savedSession) {
      toast({
        title: 'Save failed',
        description: 'Could not save clarification answers.',
      });
    }
    return savedSession;
  });

  const handleGeneratePRD = form.handleSubmit(async (values) => {
    const nextQuestions = questions.map((question, index) => ({
      ...question,
      answer: values.questions[index]?.answer ?? '',
      skipped: values.questions[index]?.skipped ?? false,
    }));

    const savedSession = await saveClarificationQuestions(nextQuestions);
    if (!savedSession) {
      toast({
        title: 'Save failed',
        description: 'Could not save clarification answers before PRD generation.',
      });
      return;
    }

    onGeneratePRD();
  });

  return (
    <div className="space-y-4">
      <div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Clarification Questions</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Answer questions to generate accurate requirements. Required questions marked with
            <span className="text-[var(--color-danger)] ml-1">*</span>
          </p>
        </div>
      </div>

      {(generationStep.status === 'succeeded' || generationStep.status === 'failed' || generationStep.status === 'unavailable' || generationStep.errorMessage) && (
        <div className="rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
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
        {groupedQuestions.map((group) => {
          const groupQuestions = questions.filter((question) => question.group === group);
          const answeredCount = groupQuestions.filter((question, index) => {
            const draft = watchedQuestions[questions.findIndex((item) => item.id === question.id)];
            return !!draft?.answer?.trim() || draft?.skipped;
          }).length;
          const isExpanded = expandedGroups.has(group);

          return (
            <div key={group} className="border border-border rounded-md overflow-hidden">
              <button
                onClick={() => toggleGroup(group)}
                className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-muted transition-colors text-left"
                data-testid={`group-toggle-${group}`}
                type="button"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  <span className="text-sm font-medium text-foreground">{group}</span>
                  <span className="text-xs px-1.5 py-0.5 bg-muted text-muted-foreground rounded">
                    {answeredCount}/{groupQuestions.length}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {groupQuestions.some((question, index) => {
                    const draft = watchedQuestions[questions.findIndex((item) => item.id === question.id)];
                    return question.required && !draft?.answer?.trim() && !draft?.skipped;
                  }) && (
                    <span className="w-2 h-2 rounded-full bg-[var(--color-danger)]" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="divide-y divide-border">
                  {groupQuestions.map((question) => {
                    const index = questions.findIndex((item) => item.id === question.id);
                    return (
                      <div key={question.id} className="px-4 py-4 bg-card">
                        <div className="flex items-start gap-2 mb-2">
                          <p className="text-xs font-medium text-foreground flex-1">
                            {question.text}
                            {question.required && <span className="text-[var(--color-danger)] ml-1">*</span>}
                          </p>
                          {!question.required && !watchedQuestions[index]?.answer?.trim() && !watchedQuestions[index]?.skipped && (
                            <button
                              onClick={() => {
                                form.setValue(`questions.${index}.answer`, '');
                                form.setValue(`questions.${index}.skipped`, true);
                              }}
                              className="text-xs text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap flex-shrink-0"
                              type="button"
                            >
                              Skip with risk
                            </button>
                          )}
                        </div>

                        {watchedQuestions[index]?.skipped ? (
                          <div className="text-xs text-muted-foreground italic bg-muted px-3 py-2 rounded border border-border">
                            Skipped — may affect story quality
                          </div>
                        ) : (
                          <Controller
                            control={form.control}
                            name={`questions.${index}.answer`}
                            render={({ field }) => (
                              <Textarea
                                {...field}
                                placeholder="Type your answer..."
                                className="text-xs min-h-[60px] resize-none"
                                data-testid={`clarification-answer-${question.id}`}
                              />
                            )}
                          />
                        )}

                        {watchedQuestions[index]?.answer?.trim() && (
                          <div className="mt-1 text-xs text-[var(--color-success)] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
                            Answered
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <StepActionBar isLoading={isGenerating}>
        {!allRequiredAnswered && (
          <span className="mr-auto text-xs text-[var(--color-danger)] flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {requiredUnanswered.length} required unanswered
          </span>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={onGenerateClarification}
          disabled={isGenerating}
          data-testid="button-generate-clarification"
        >
          {isGenerating ? <Spinner className="h-3.5 w-3.5" /> : null}
          {questions.length > 0 ? 'Regenerate Questions' : 'Generate Questions'}
        </Button>
        <Button
          size="sm"
          onClick={handleGeneratePRD}
          disabled={!allRequiredAnswered || isGenerating}
          data-testid="button-generate-prd"
        >
          {isGenerating ? <Spinner className="h-3.5 w-3.5" /> : null}
          Generate PRD
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={saveDraft}
          disabled={isGenerating}
          data-testid="button-save-clarifications"
        >
          {isGenerating ? <Spinner className="h-3.5 w-3.5" /> : null}
          Save Answers
        </Button>
      </StepActionBar>
    </div>
  );
}
