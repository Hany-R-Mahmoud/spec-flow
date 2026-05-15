import { useEffect, useState, type ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, ShieldCheck, Trash2, X } from 'lucide-react';
import { useSessionStore } from '@/store/session-store';
import { ThemeModeToggle } from '@/components/shared/ThemeModeToggle';
import { StepSkillsSection } from '@/components/settings/StepSkillsSection';
import { Badge } from '@/components/ui/badge';
import {
  deleteAiProvider,
  rotateAiProvider,
  updateAiProvider,
  validateAiProvider,
} from '@workspace/api-client-react';

type SettingsFormValues = {
  workspaceName: string;
  jiraKey: string;
  defaultLabels: string[];
  defaultComponents: string[];
  templatePreference: string;
  qualityThreshold: number;
  devReviewRequired: boolean;
  autoGenerateQuestions: boolean;
  showReadinessWarnings: boolean;
};

function ChipsInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [input, setInput] = useState('');
  const add = () => {
    const t = input.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setInput('');
  };
  return (
    <div className="border border-input rounded-md px-3 py-2 min-h-[36px] flex flex-wrap gap-1.5 bg-background focus-within:ring-2 focus-within:ring-ring">
      {value.map(v => (
        <span key={v} className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted rounded text-xs">
          {v}
          <button type="button" onClick={() => onChange(value.filter(x => x !== v))} className="text-muted-foreground hover:text-foreground">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        placeholder={value.length === 0 ? placeholder : 'Add more...'}
        className="flex-1 min-w-20 text-xs bg-transparent outline-none"
      />
    </div>
  );
}

function SettingsSection({
  title,
  children,
  onSave,
}: {
  title: string;
  children: ReactNode;
  onSave?: () => void | Promise<void>;
}) {
  return (
    <div className="bg-card border border-border rounded-md overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        {onSave ? (
          <Button type="button" size="sm" variant="outline" onClick={onSave} className="text-xs h-7">
            Save
          </Button>
        ) : null}
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  );
}

function AiProviderSection() {
  const { toast } = useToast();
  const { state, refreshAiCapability } = useSessionStore();
  const provider = state.aiCapability?.provider;
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(provider?.model ?? 'gpt-4o-mini');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setModel(provider?.model ?? 'gpt-4o-mini');
  }, [provider?.model]);

  const status = provider?.status ?? 'not_configured';
  const configured = Boolean(provider?.configured);

  const saveProvider = async () => {
    try {
      setIsSaving(true);
      await updateAiProvider({
        provider: 'openai',
        model,
        apiKey,
        enabled: true,
      });
      setApiKey('');
      await refreshAiCapability();
      toast({ title: 'AI provider saved', description: 'Provider key validated and stored securely.' });
    } catch (error) {
      toast({
        title: 'Provider save failed',
        description: error instanceof Error ? error.message : 'Could not save AI provider.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const validateProvider = async () => {
    try {
      setIsSaving(true);
      await validateAiProvider();
      await refreshAiCapability();
      toast({ title: 'Validation complete', description: 'AI provider status refreshed.' });
    } catch (error) {
      toast({
        title: 'Validation failed',
        description: error instanceof Error ? error.message : 'Could not validate AI provider.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const rotateProvider = async () => {
    try {
      setIsSaving(true);
      await rotateAiProvider({ apiKey });
      setApiKey('');
      await refreshAiCapability();
      toast({ title: 'Provider key rotated', description: 'New key validated and stored securely.' });
    } catch (error) {
      toast({
        title: 'Rotation failed',
        description: error instanceof Error ? error.message : 'Could not rotate AI provider key.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const removeProvider = async () => {
    try {
      setIsSaving(true);
      await deleteAiProvider();
      setApiKey('');
      await refreshAiCapability();
      toast({ title: 'AI provider removed', description: 'Workspace returned to manual mode.' });
    } catch (error) {
      toast({
        title: 'Remove failed',
        description: error instanceof Error ? error.message : 'Could not remove AI provider.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsSection title="AI Provider">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={configured ? 'default' : 'outline'}>
          {configured ? 'AI enabled' : 'Manual mode'}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {status.replaceAll('_', ' ')}
          {provider?.keySuffix ? ` · key ending ${provider.keySuffix}` : ''}
        </span>
      </div>

      <div className="rounded border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          BYOK security
        </div>
        <p className="mt-1">
          Keys are submitted once, encrypted on the API server, and never returned to the browser.
          Removing the provider disables generation immediately and preserves existing artifacts.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
        <div>
          <Label className="text-xs font-medium mb-1.5 block">Provider</Label>
          <Input value="OpenAI" disabled className="h-8 text-xs" />
        </div>
        <div>
          <Label className="text-xs font-medium mb-1.5 block">Model</Label>
          <Input
            value={model}
            onChange={(event) => setModel(event.target.value)}
            className="h-8 text-xs font-mono"
            placeholder="gpt-4o-mini"
            data-testid="input-ai-provider-model"
          />
        </div>
      </div>

      <div>
        <Label className="text-xs font-medium mb-1.5 block">API Key</Label>
        <Input
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
          className="h-8 text-xs font-mono"
          type="password"
          placeholder={configured ? 'Enter a new key to rotate' : 'sk-...'}
          autoComplete="off"
          data-testid="input-ai-provider-key"
        />
      </div>

      {provider?.validationError ? (
        <p className="text-xs text-[var(--color-danger)]">{provider.validationError}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          className="h-8 text-xs"
          onClick={configured ? rotateProvider : saveProvider}
          disabled={isSaving || apiKey.trim().length < 8 || model.trim().length === 0}
        >
          <KeyRound className="mr-2 h-3.5 w-3.5" />
          {configured ? 'Rotate Key' : 'Save Provider'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 text-xs"
          onClick={validateProvider}
          disabled={isSaving || !provider?.id}
        >
          Validate
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 text-xs text-[var(--color-danger)]"
          onClick={removeProvider}
          disabled={isSaving || !provider?.id}
        >
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          Remove
        </Button>
      </div>
    </SettingsSection>
  );
}

export function SettingsPage() {
  const { toast } = useToast();
  const { saveSettings, state } = useSessionStore();

  const form = useForm<SettingsFormValues>({
    defaultValues: {
      workspaceName: 'Acme Corp Workspace',
      jiraKey: 'ACME',
      defaultLabels: ['Feature', 'Backend', 'Frontend'],
      defaultComponents: ['API', 'Web App'],
      templatePreference: 'Standard',
      qualityThreshold: 75,
      devReviewRequired: true,
      autoGenerateQuestions: true,
      showReadinessWarnings: true,
    },
  });

  useEffect(() => {
    if (!state.settings) {
      return;
    }

    form.reset({
      workspaceName: state.settings.workspaceName,
      jiraKey: state.settings.jiraKey,
      defaultLabels: state.settings.defaultLabels,
      defaultComponents: state.settings.defaultComponents,
      templatePreference: state.settings.templatePreference,
      qualityThreshold: state.settings.qualityThreshold,
      devReviewRequired: state.settings.devReviewRequired,
      autoGenerateQuestions: state.settings.autoGenerateQuestions,
      showReadinessWarnings: state.settings.showReadinessWarnings,
    });
  }, [form, state.settings]);

  const save = async (section: string, values: Partial<SettingsFormValues>) => {
    if (!state.settings) {
      return;
    }

    try {
      await saveSettings({
        ...state.settings,
        ...values,
        qualityThreshold: values.qualityThreshold ?? state.settings.qualityThreshold,
        workspaceName: values.workspaceName ?? state.settings.workspaceName,
        jiraKey: values.jiraKey ?? state.settings.jiraKey,
        defaultLabels: values.defaultLabels ?? state.settings.defaultLabels,
        defaultComponents: values.defaultComponents ?? state.settings.defaultComponents,
        templatePreference: values.templatePreference ?? state.settings.templatePreference,
        devReviewRequired: values.devReviewRequired ?? state.settings.devReviewRequired,
        autoGenerateQuestions: values.autoGenerateQuestions ?? state.settings.autoGenerateQuestions,
        showReadinessWarnings: values.showReadinessWarnings ?? state.settings.showReadinessWarnings,
      });

      toast({ title: 'Saved', description: `${section} settings saved.` });
    } catch (error) {
      toast({
        title: 'Save failed',
        description:
          error instanceof Error ? error.message : 'Could not save settings.',
      });
    }
  };

  const saveWorkspace = form.handleSubmit(values => save('Workspace', {
    workspaceName: values.workspaceName,
    jiraKey: values.jiraKey,
  }));
  const saveStoryDefaults = form.handleSubmit(values => save('Story Defaults', {
    defaultLabels: values.defaultLabels,
    defaultComponents: values.defaultComponents,
    templatePreference: values.templatePreference,
    qualityThreshold: values.qualityThreshold,
  }));
  const saveWorkflow = form.handleSubmit(values => save('Workflow', {
    devReviewRequired: values.devReviewRequired,
    autoGenerateQuestions: values.autoGenerateQuestions,
    showReadinessWarnings: values.showReadinessWarnings,
  }));

  if (state.isLoading && !state.settings) {
    return (
      <div className="max-w-2xl space-y-3">
        <h1 className="text-lg font-semibold text-foreground">Settings</h1>
        <p className="text-xs text-muted-foreground">Loading persisted workspace settings…</p>
      </div>
    );
  }

  if (state.error && !state.settings) {
    return (
      <div className="max-w-2xl space-y-3">
        <h1 className="text-lg font-semibold text-foreground">Settings</h1>
        <p className="text-xs text-[var(--color-danger)]">{state.error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Settings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Configure workspace defaults, AI provider access, and workflow preferences</p>
      </div>

      <SettingsSection title="Appearance">
        <div className="space-y-2">
          <Label className="text-xs font-medium block">Theme</Label>
          <p className="text-xs text-muted-foreground">Switch the whole app between light and dark mode.</p>
          <ThemeModeToggle className="w-full justify-start" />
        </div>
      </SettingsSection>

      <AiProviderSection />

      <StepSkillsSection />

      <form onSubmit={e => e.preventDefault()} className="space-y-6">
        <SettingsSection title="Workspace" onSave={saveWorkspace}>
          <Controller
            control={form.control}
            name="workspaceName"
            render={({ field }) => (
              <div>
                <Label className="text-xs font-medium mb-1.5 block">Workspace Name</Label>
                <Input
                  {...field}
                  className="h-8 text-xs"
                  data-testid="input-workspace-name"
                />
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="jiraKey"
            render={({ field }) => (
              <div>
                <Label className="text-xs font-medium mb-1.5 block">Default Jira Project Key</Label>
                <Input
                  {...field}
                  onChange={e => field.onChange(e.target.value.toUpperCase())}
                  className="h-8 text-xs font-mono uppercase"
                  placeholder="e.g. ACME"
                  data-testid="input-default-jira-key"
                />
                <p className="text-xs text-muted-foreground mt-1">Used as default for new breakdowns if no key is specified.</p>
              </div>
            )}
          />
        </SettingsSection>

        <SettingsSection title="Story Defaults" onSave={saveStoryDefaults}>
          <Controller
            control={form.control}
            name="defaultLabels"
            render={({ field }) => (
              <div>
                <Label className="text-xs font-medium mb-1.5 block">Default Labels</Label>
                <ChipsInput value={field.value} onChange={field.onChange} placeholder="Add a label..." />
                <p className="text-xs text-muted-foreground mt-1">Applied to all generated stories by default.</p>
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="defaultComponents"
            render={({ field }) => (
              <div>
                <Label className="text-xs font-medium mb-1.5 block">Default Components</Label>
                <ChipsInput value={field.value} onChange={field.onChange} placeholder="Add a component..." />
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="templatePreference"
            render={({ field }) => (
              <div>
                <Label className="text-xs font-medium mb-1.5 block">Story Template Preference</Label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-8 text-xs" data-testid="select-template">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Minimal" className="text-xs">Minimal - Core fields only</SelectItem>
                    <SelectItem value="Standard" className="text-xs">Standard - Full story set</SelectItem>
                    <SelectItem value="Detailed" className="text-xs">Detailed - With edge cases, analytics, and localization</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="qualityThreshold"
            render={({ field }) => (
              <div>
                <Label className="text-xs font-medium mb-3 block">
                  Quality Threshold - {field.value}/100
                </Label>
                <div className="px-1">
                  <Slider
                    value={[field.value]}
                    onValueChange={values => field.onChange(values[0] ?? 75)}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                    data-testid="slider-quality-threshold"
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>0 - Any</span>
                  <span className="text-[var(--color-warning)]">60 - Min</span>
                  <span className="text-primary">75 - Recommended</span>
                  <span className="text-[var(--color-success)]">90 - Strict</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Stories below this score will show quality warnings and be flagged during export.
                </p>
              </div>
            )}
          />
        </SettingsSection>

        <SettingsSection title="Workflow" onSave={saveWorkflow}>
          <Controller
            control={form.control}
            name="devReviewRequired"
            render={({ field }) => (
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Label htmlFor="dev-review" className="text-xs font-medium cursor-pointer">Developer Review Required</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Require developer review before stories can be exported.</p>
                </div>
                <Switch
                  id="dev-review"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  data-testid="switch-dev-review"
                />
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="autoGenerateQuestions"
            render={({ field }) => (
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Label htmlFor="auto-questions" className="text-xs font-medium cursor-pointer">Auto-generate Clarification Questions</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Automatically generate questions when starting a new breakdown.</p>
                </div>
                <Switch
                  id="auto-questions"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  data-testid="switch-auto-questions"
                />
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="showReadinessWarnings"
            render={({ field }) => (
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Label htmlFor="readiness-warnings" className="text-xs font-medium cursor-pointer">Show Readiness Warnings</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Display quality warnings on story cards and in the quality panel.</p>
                </div>
                <Switch
                  id="readiness-warnings"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  data-testid="switch-readiness-warnings"
                />
              </div>
            )}
          />
        </SettingsSection>
      </form>
    </div>
  );
}
