import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useSessionStore } from '@/store/session-store';
import { ProjectSession, Phase } from '@/lib/types';
import { ArrowRight, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  inputType: z.string().min(1, 'Select an input type'),
  outputDepth: z.string().min(1, 'Select output depth'),
  jiraKey: z.string().optional(),
  businessGoal: z.string().optional(),
  knownConstraints: z.string().optional(),
  rawInput: z.string().min(10, 'Product input is required (min 10 characters)'),
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
  const { dispatch } = useSessionStore();
  const [, setLocation] = useLocation();
  const [targetUsers, setTargetUsers] = useState<string[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [charCount, setCharCount] = useState(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      inputType: '',
      outputDepth: 'Standard',
      jiraKey: '',
      businessGoal: '',
      knownConstraints: '',
      rawInput: '',
    },
  });

  const onSubmit = (data: FormValues) => {
    const id = `session-${Date.now()}`;
    const phaseStatuses = {
      intake: 'complete' as const,
      clarification: 'in-progress' as const,
      prd: 'not-started' as const,
      epics: 'not-started' as const,
      stories: 'not-started' as const,
      quality: 'not-started' as const,
      devReview: 'not-started' as const,
      export: 'not-started' as const,
    };

    const session: ProjectSession = {
      id,
      name: data.name,
      inputType: data.inputType,
      outputDepth: data.outputDepth,
      jiraKey: (data.jiraKey || '').toUpperCase(),
      targetUsers,
      businessGoal: data.businessGoal || '',
      knownConstraints: data.knownConstraints || '',
      labels,
      rawInput: data.rawInput,
      currentPhase: 'clarification',
      phases: phaseStatuses,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_SESSION', payload: session });
    setLocation(`/workspace/${id}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">New Breakdown</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Fill in the intake form to start a guided AI breakdown</p>
      </div>

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
                            field.value === t.value ? 'border-primary bg-[var(--color-primary-soft)]' : 'border-border hover:bg-muted'
                          )}>
                            <RadioGroupItem value={t.value} id={`input-type-${t.value}`} className="flex-shrink-0" />
                            <Label htmlFor={`input-type-${t.value}`} className="cursor-pointer flex-1">
                              <span className="text-xs font-medium text-foreground">{t.value}</span>
                              <span className="text-xs text-muted-foreground ml-2">{t.description}</span>
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
                            field.value === d.value ? 'border-primary bg-[var(--color-primary-soft)]' : 'border-border hover:bg-muted'
                          )}
                        >
                          <div className="text-xs font-medium text-foreground">{d.label}</div>
                          <div className="text-xs text-muted-foreground">{d.desc}</div>
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

                <div>
                  <label className="text-xs font-medium">Target Users</label>
                  <div className="mt-1.5">
                    <ChipsInput value={targetUsers} onChange={setTargetUsers} placeholder="Type a user role, press Enter" />
                  </div>
                </div>

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

                <div>
                  <label className="text-xs font-medium">Labels / Components</label>
                  <div className="mt-1.5">
                    <ChipsInput value={labels} onChange={setLabels} placeholder="Type a label, press Enter" />
                  </div>
                </div>
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
                        onChange={e => { field.onChange(e); setCharCount(e.target.value.length); }}
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

              <Button
                type="submit"
                className="w-full"
                size="sm"
                data-testid="button-start-breakdown"
              >
                Start Guided Breakdown
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                AI will generate clarification questions, PRD, epics, and Jira-ready stories based on your input.
              </p>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
