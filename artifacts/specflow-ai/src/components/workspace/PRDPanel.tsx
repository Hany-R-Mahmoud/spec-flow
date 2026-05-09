import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { CheckCircle, Edit3, Save, XCircle } from 'lucide-react';
import { GenerationStepState, PRDSection } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useSessionStore } from '@/store/session-store';

interface PRDPanelProps {
  sections: PRDSection[];
  generationStep: GenerationStepState;
  onGeneratePRD: () => void;
  onGenerateEpics: () => void;
}

type PRDFormValues = {
  content: string;
};

export function PRDPanel({
  sections,
  generationStep,
  onGeneratePRD,
  onGenerateEpics,
}: PRDPanelProps) {
  const { savePrdSections } = useSessionStore();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const isGenerating = generationStep.status === 'running';

  const form = useForm<PRDFormValues>({
    defaultValues: {
      content: '',
    },
  });

  const completedCount = sections.filter((section) => section.complete).length;
  const editingSection = sections.find((section) => section.id === editingId) ?? null;

  useEffect(() => {
    if (editingSection) {
      form.reset({ content: editingSection.content });
    } else {
      form.reset({ content: '' });
    }
  }, [editingSection, form]);

  const startEdit = (section: PRDSection) => {
    setEditingId(section.id);
    form.reset({ content: section.content });
  };

  const cancelEdit = () => {
    setEditingId(null);
    form.reset({ content: '' });
  };

  const saveEdit = form.handleSubmit(async (values) => {
    if (!editingSection) {
      return;
    }

    const nextSections = sections.map((section) =>
      section.id === editingSection.id
        ? {
            ...section,
            content: values.content,
            complete: values.content.trim().length > 0,
          }
        : section,
    );

    const savedSession = await savePrdSections(nextSections);
    if (savedSession) {
      toast({
        title: 'Saved',
        description: `${editingSection.title} updated.`,
      });
      setEditingId(null);
      return;
    }

    toast({
      title: 'Save failed',
      description: 'Could not save PRD section.',
    });
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Product Requirements Document</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {completedCount}/{sections.length} sections complete — review and edit as needed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onGeneratePRD} disabled={isGenerating}>
            Regenerate PRD
          </Button>
          <Button
            size="sm"
            onClick={onGenerateEpics}
            disabled={isGenerating || sections.length === 0}
            data-testid="button-generate-epics"
          >
            Generate Epics
          </Button>
        </div>
      </div>

      {(generationStep.status !== 'idle' || generationStep.errorMessage) && (
        <div className="rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          {generationStep.status === 'running' && <span>Generating PRD sections…</span>}
          {generationStep.status === 'succeeded' && (
            <span>PRD sections generated and saved.</span>
          )}
          {generationStep.status === 'failed' && (
            <span className="text-[var(--color-danger)]">{generationStep.errorMessage || 'PRD generation failed. Retry when ready.'}</span>
          )}
          {generationStep.status === 'unavailable' && (
            <span className="text-[var(--color-warning)]">{generationStep.errorMessage || 'PRD generation is unavailable right now.'}</span>
          )}
        </div>
      )}

      <div className="space-y-3">
        {sections
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((section) => {
            const isEditing = editingId === section.id;

            return (
              <div key={section.id} className="border border-border rounded-md overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-muted border-b border-border">
                  <div className="flex items-center gap-2">
                    {section.complete ? (
                      <CheckCircle className="w-3.5 h-3.5 text-[var(--color-success)]" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                    <span className="text-xs font-semibold text-foreground">{section.title}</span>
                    <span
                      className={cn(
                        'text-xs px-1.5 py-0.5 rounded',
                        section.complete
                          ? 'bg-[var(--color-success-soft)] text-[var(--color-success)]'
                          : 'bg-muted-foreground/10 text-muted-foreground',
                      )}
                    >
                      {section.complete ? 'Complete' : 'Incomplete'}
                    </span>
                  </div>
                  {!isEditing ? (
                    <button
                      onClick={() => startEdit(section)}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                      data-testid={`button-edit-prd-${section.id}`}
                      type="button"
                    >
                      <Edit3 className="w-3 h-3" />
                      Edit
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={cancelEdit}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        type="button"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveEdit}
                        className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors"
                        type="button"
                      >
                        <Save className="w-3 h-3" />
                        Save
                      </button>
                    </div>
                  )}
                </div>

                <div className="px-4 py-3 bg-card">
                  {isEditing ? (
                    <Controller
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          className="text-xs min-h-[100px] resize-none font-mono"
                          autoFocus
                          data-testid={`textarea-prd-${section.id}`}
                        />
                      )}
                    />
                  ) : (
                    <pre className="text-xs text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                      {section.content || <span className="text-muted-foreground italic">No content yet — click Edit to add</span>}
                    </pre>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
