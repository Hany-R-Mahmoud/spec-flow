import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useSessionStore } from '@/store/session-store';
import { useToast } from '@/hooks/use-toast';
import { analyzeAdaptiveIntake, buildAdaptiveArtifacts, buildAdaptivePhasePatch } from '@/lib/adaptive-intake';
import { getAiProviderUiState } from '@/lib/ai-capability';
import { AlertCircle, ArrowRight, FileSearch, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  inputType: z.string().min(1, 'Select an input type'),
  outputDepth: z.string().min(1, 'Select output depth'),
  jiraKey: z.string().optional(),
  businessGoal: z.string().optional(),
  knownConstraints: z.string().optional(),
  targetUsers: z.array(z.string()),
  labels: z.array(z.string()),
  rawInput: z.string().min(10, 'Product input is required (min 10 characters)'),
  reuseDetectedContent: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const INPUT_TYPES = [
  { value: 'Rough idea', description: 'Early-stage, unstructured thoughts' },
  { value: 'PRD draft', description: 'Partial or incomplete PRD' },
  { value: 'Meeting notes', description: 'Notes from stakeholder meetings' },
  { value: 'Stakeholder request', description: 'Formal feature request' },
  { value: 'Transcript', description: 'Call or interview transcript' },
  { value: 'Mixed notes', description: 'Various inputs combined' },
];

const OUTPUT_DEPTHS = [
  { value: 'Quick', label: 'Quick', desc: 'Core stories only' },
  { value: 'Standard', label: 'Standard', desc: 'Full story set' },
  { value: 'Detailed', label: 'Detailed', desc: 'Stories + edge cases + analytics' },
];

function ChipsInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [input, setInput] = useState('');
  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed]);
    setInput('');
  };
  const remove = (chip: string) => onChange(value.filter(v => v !== chip));

  return (
    <div className="border border-input rounded-md px-3 py-2 min-h-[36px] flex flex-wrap gap-1.5 bg-background focus-within:ring-2 focus-within:ring-ring">
      {value.map(chip => (
        <span key={chip} className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted rounded text-xs">
          {chip}
          <button type="button" onClick={() => remove(chip)} className="text-muted-foreground hover:text-foreground">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        placeholder={value.length === 0 ? placeholder : 'Add more...'}
        className="flex-1 min-w-24 text-xs bg-transparent outline-none"
      />
    </div>
  );
}

export function NewBreakdown() {
  const { createSession, state } = useSessionStore();
  const providerUi = getAiProviderUiState(state.aiCapability);
  const showManualModeBanner = !providerUi.isAiEnabled;
  const headerCopy = providerUi.isAiEnabled
    ? 'Fill in the intake form to start an AI-assisted breakdown'
    : 'Fill in the intake form to organize a manual breakdown.';
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      inputType: '',
      outputDepth: 'Standard',
      jiraKey: '',
      businessGoal: '',
      knownConstraints: '',
      targetUsers: [],
      labels: [],
      rawInput: '',
      reuseDetectedContent: true,
    },
  });

  useEffect(() => {
    if (!state.settings) {
      return;
    }

    form.reset({
      name: '',
      inputType: '',
      outputDepth: 'Standard',
      jiraKey: state.settings.jiraKey ?? '',
      businessGoal: '',
      knownConstraints: '',
      targetUsers: [],
      labels: state.settings.defaultLabels ?? [],
      rawInput: '',
      reuseDetectedContent: true,
    });
  }, [form, state.settings]);

  const rawInput = useWatch({ control: form.control, name: 'rawInput' }) ?? '';
  const inputType = useWatch({ control: form.control, name: 'inputType' }) ?? '';
  const businessGoal = useWatch({ control: form.control, name: 'businessGoal' }) ?? '';
  const knownConstraints = useWatch({ control: form.control, name: 'knownConstraints' }) ?? '';
  const targetUsers = useWatch({ control: form.control, name: 'targetUsers' }) ?? [];
  const labels = useWatch({ control: form.control, name: 'labels' }) ?? [];
  const reuseDetectedContent = useWatch({ control: form.control, name: 'reuseDetectedContent' }) ?? true;
  const charCount = rawInput.length;
  const adaptiveAnalysis = useMemo(
    () =>
      analyzeAdaptiveIntake({
        rawInput,
        inputType,
        businessGoal,
        knownConstraints,
        targetUsers,
        labels,
      }),
    [businessGoal, inputType, knownConstraints, labels, rawInput, targetUsers],
  );

  const onSubmit = async (data: FormValues) => {
    try {
      const analysis = analyzeAdaptiveIntake(data);
      const adaptivePatch =
        data.reuseDetectedContent && analysis.hasDetectedContent
          ? buildAdaptivePhasePatch(analysis)
          : null;
      const session = await createSession({
        name: data.name,
        inputType: data.inputType,
        outputDepth: data.outputDepth,
        jiraKey: data.jiraKey || '',
        targetUsers: data.targetUsers,
        businessGoal: data.businessGoal || '',
        knownConstraints: data.knownConstraints || '',
        labels: data.labels,
        rawInput: data.rawInput,
        initialArtifacts:
          data.reuseDetectedContent && analysis.hasDetectedContent
            ? (sessionId) => buildAdaptiveArtifacts(data, sessionId)
            : undefined,
        initialPhase: adaptivePatch?.currentPhase,
        initialPhases: adaptivePatch?.phases,
      });

      setLocation(`/workspace/${session.id}`);
    } catch (error) {
      toast({
        title: 'Create failed',
        description:
          error instanceof Error ? error.message : 'Could not create session.',
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">New Breakdown</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{headerCopy}</p>
      </div>

      {showManualModeBanner ? (
        <div className="rounded-md border border-[var(--color-warning)]/30 bg-[var(--color-warning-soft)] px-4 py-3 text-xs text-foreground">
          <div className="flex items-center gap-2 font-medium text-[var(--color-warning)]">
            <AlertCircle className="h-4 w-4" />
            {providerUi.label}
          </div>
          <p className="mt-1 text-muted-foreground">
            {providerUi.helperText} You can continue in manual mode.
          </p>
        </div>
      ) : null}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
          <div className="grid grid-cols-[1fr_1fr] gap-6 items-start">
            {/* Left column */}
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-md p-4 space-y-4">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border pb-2 mb-3">Project Details</div>

                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">Project / Module Name <span className="text-[var(--color-danger)]">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Team Access Management" className="h-8 text-xs" data-testid="input-project-name" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />

                <FormField control={form.control} name="inputType" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">Input Type <span className="text-[var(--color-danger)]">*</span></FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="space-y-1"
                        data-testid="radio-input-type"
                      >
                        {INPUT_TYPES.map(t => (
                          <div key={t.value} className={cn('flex items-center gap-3 px-3 py-2 rounded border cursor-pointer transition-colors',
                            field.value === t.value ? 'border-primary bg-[var(--color-primary-soft)] ring-1 ring-primary/20 shadow-sm' : 'border-border bg-card hover:bg-muted/70'
                          )}>
                            <RadioGroupItem value={t.value} id={`input-type-${t.value}`} className="flex-shrink-0" />
                            <Label htmlFor={`input-type-${t.value}`} className="cursor-pointer flex-1">
                              <span className={cn('text-xs', field.value === t.value ? 'font-semibold text-foreground' : 'font-medium text-foreground')}>
                                {t.value}
                              </span>
                              <span className={cn('ml-2 text-xs', field.value === t.value ? 'text-foreground/80' : 'text-muted-foreground')}>
                                {t.description}
                              </span>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />

                <FormField control={form.control} name="outputDepth" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">Output Depth <span className="text-[var(--color-danger)]">*</span></FormLabel>
                    <div className="flex gap-2">
                      {OUTPUT_DEPTHS.map(d => (
                        <button
                          key={d.value}
                          type="button"
                          onClick={() => field.onChange(d.value)}
                          className={cn('flex-1 px-3 py-2 rounded border text-left transition-colors',
                            field.value === d.value ? 'border-primary bg-[var(--color-primary-soft)] ring-1 ring-primary/20 shadow-sm' : 'border-border bg-card hover:bg-muted/70'
                          )}
                        >
                          <div className={cn('text-xs', field.value === d.value ? 'font-semibold text-foreground' : 'font-medium text-foreground')}>
                            {d.label}
                          </div>
                          <div className={cn('text-xs', field.value === d.value ? 'text-foreground/80' : 'text-muted-foreground')}>
                            {d.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />

                <FormField control={form.control} name="jiraKey" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">Jira Project Key</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={e => field.onChange(e.target.value.toUpperCase())}
                        placeholder="e.g. TAM"
                        className="h-8 text-xs font-mono uppercase"
                        data-testid="input-jira-key"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />

                <FormField control={form.control} name="targetUsers" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">Target Users</FormLabel>
                    <FormControl>
                      <ChipsInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Type a user role, press Enter"
                      />
                    </FormControl>
                  </FormItem>
                )} />

                <FormField control={form.control} name="businessGoal" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">Business Goal</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="What business outcome does this enable?" className="text-xs min-h-[56px] resize-none" />
                    </FormControl>
                  </FormItem>
                )} />

                <FormField control={form.control} name="knownConstraints" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">Known Constraints</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Technical, legal, time, or resource constraints" className="text-xs min-h-[56px] resize-none" />
                    </FormControl>
                  </FormItem>
                )} />

                <FormField control={form.control} name="labels" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">Labels / Components</FormLabel>
                    <FormControl>
                      <ChipsInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Type a label, press Enter"
                      />
                    </FormControl>
                  </FormItem>
                )} />
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-md p-4 space-y-3">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border pb-2 mb-3">Product Input <span className="text-[var(--color-danger)]">*</span></div>

                <FormField control={form.control} name="rawInput" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-muted-foreground">
                      Paste your messy input here — notes, transcript, PRD draft, raw ideas
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="We need users to invite team members to projects, assign roles, and manage access. Admins should be able to remove users. Some roles should only view data. Need to support email invites and handle expired invitations..."
                        className="text-xs min-h-[340px] resize-none font-mono leading-relaxed"
                        data-testid="textarea-raw-input"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{charCount} characters</span>
                  {charCount > 0 && (
                    <span className={cn('px-2 py-0.5 rounded',
                      charCount > 500 ? 'bg-[var(--color-success-soft)] text-[var(--color-success)]' :
                      charCount > 100 ? 'bg-[var(--color-warning-soft)] text-[var(--color-warning)]' :
                      'bg-[var(--color-danger-soft)] text-[var(--color-danger)]'
                    )}>
                      {charCount > 500 ? 'Detailed input — good' : charCount > 100 ? 'Some context' : 'Very brief — add more detail'}
                    </span>
                  )}
                </div>
              </div>

              {adaptiveAnalysis.hasDetectedContent && (
                <div className="bg-card border border-border rounded-md p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3 border-b border-border pb-2">
                    <div className="flex items-center gap-2">
                      <FileSearch className="h-4 w-4 text-primary" />
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Detected Progress
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      Start at {adaptiveAnalysis.recommendedPhase}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {adaptiveAnalysis.summary}
                  </p>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      ['PRD', adaptiveAnalysis.detected.prdSections],
                      ['Stories', adaptiveAnalysis.detected.stories],
                      ['Answers', adaptiveAnalysis.detected.clarificationAnswers],
                      ['Unknowns', adaptiveAnalysis.detected.unknownNotes],
                    ].map(([label, count]) => (
                      <div key={label} className="rounded border border-border bg-background p-2 text-center">
                        <div className="text-sm font-semibold text-foreground">{count}</div>
                        <div className="text-[10px] text-muted-foreground">{label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {adaptiveAnalysis.phasePlan.map((item) => (
                      <div key={item.phase} className="rounded border border-border bg-muted/30 p-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-foreground">{item.label}</span>
                          <span className={cn(
                            'rounded px-1.5 py-0.5 text-[10px]',
                            item.action === 'reuse'
                              ? 'bg-[var(--color-success-soft)] text-[var(--color-success)]'
                              : item.readiness === 'partial'
                                ? 'bg-[var(--color-warning-soft)] text-[var(--color-warning)]'
                                : 'bg-muted text-muted-foreground',
                          )}>
                            {item.action}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                          {item.evidence}
                        </p>
                      </div>
                    ))}
                  </div>

                  <FormField control={form.control} name="reuseDetectedContent" render={({ field }) => (
                    <FormItem className="flex items-start gap-2 rounded border border-border bg-background p-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => field.onChange(checked === true)}
                          data-testid="checkbox-reuse-detected-content"
                        />
                      </FormControl>
                      <div className="space-y-0.5">
                        <FormLabel className="text-xs font-medium">
                          Reuse detected content and skip completed steps
                        </FormLabel>
                        <p className="text-[11px] text-muted-foreground">
                          Imported content is preserved. Missing parts can still be generated later.
                        </p>
                      </div>
                    </FormItem>
                  )} />
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                size="sm"
                loading={form.formState.isSubmitting}
                data-testid="button-start-breakdown"
              >
                {form.formState.isSubmitting
                  ? 'Creating…'
                  : reuseDetectedContent && adaptiveAnalysis.hasDetectedContent
                    ? `Start at ${adaptiveAnalysis.recommendedPhase}`
                    : 'Start Guided Breakdown'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
