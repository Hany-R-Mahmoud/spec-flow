import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

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

function SettingsSection({ title, children, onSave }: { title: string; children: React.ReactNode; onSave: () => void }) {
  return (
    <div className="bg-card border border-border rounded-md overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <Button size="sm" variant="outline" onClick={onSave} className="text-xs h-7">
          Save
        </Button>
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  );
}

export function SettingsPage() {
  const { toast } = useToast();
  const save = (section: string) => toast({ title: 'Saved', description: `${section} settings saved.` });

  const [workspaceName, setWorkspaceName] = useState('Acme Corp Workspace');
  const [jiraKey, setJiraKey] = useState('ACME');
  const [defaultLabels, setDefaultLabels] = useState(['Feature', 'Backend', 'Frontend']);
  const [defaultComponents, setDefaultComponents] = useState(['API', 'Web App']);
  const [templatePreference, setTemplatePreference] = useState('Standard');
  const [qualityThreshold, setQualityThreshold] = useState([75]);
  const [devReviewRequired, setDevReviewRequired] = useState(true);
  const [autoGenerateQuestions, setAutoGenerateQuestions] = useState(true);
  const [showReadinessWarnings, setShowReadinessWarnings] = useState(true);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Settings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Configure your workspace and story generation preferences</p>
      </div>

      <SettingsSection title="Workspace" onSave={() => save('Workspace')}>
        <div>
          <Label className="text-xs font-medium mb-1.5 block">Workspace Name</Label>
          <Input
            value={workspaceName}
            onChange={e => setWorkspaceName(e.target.value)}
            className="h-8 text-xs"
            data-testid="input-workspace-name"
          />
        </div>
        <div>
          <Label className="text-xs font-medium mb-1.5 block">Default Jira Project Key</Label>
          <Input
            value={jiraKey}
            onChange={e => setJiraKey(e.target.value.toUpperCase())}
            className="h-8 text-xs font-mono uppercase"
            placeholder="e.g. ACME"
            data-testid="input-default-jira-key"
          />
          <p className="text-xs text-muted-foreground mt-1">Used as default for new breakdowns if no key is specified.</p>
        </div>
      </SettingsSection>

      <SettingsSection title="Story Defaults" onSave={() => save('Story Defaults')}>
        <div>
          <Label className="text-xs font-medium mb-1.5 block">Default Labels</Label>
          <ChipsInput value={defaultLabels} onChange={setDefaultLabels} placeholder="Add a label..." />
          <p className="text-xs text-muted-foreground mt-1">Applied to all generated stories by default.</p>
        </div>
        <div>
          <Label className="text-xs font-medium mb-1.5 block">Default Components</Label>
          <ChipsInput value={defaultComponents} onChange={setDefaultComponents} placeholder="Add a component..." />
        </div>
        <div>
          <Label className="text-xs font-medium mb-1.5 block">Story Template Preference</Label>
          <Select value={templatePreference} onValueChange={setTemplatePreference}>
            <SelectTrigger className="h-8 text-xs" data-testid="select-template">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Minimal" className="text-xs">Minimal — Core fields only</SelectItem>
              <SelectItem value="Standard" className="text-xs">Standard — Full story set</SelectItem>
              <SelectItem value="Detailed" className="text-xs">Detailed — With edge cases, analytics, and localization</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs font-medium mb-3 block">
            Quality Threshold — {qualityThreshold[0]}/100
          </Label>
          <div className="px-1">
            <Slider
              value={qualityThreshold}
              onValueChange={setQualityThreshold}
              min={0}
              max={100}
              step={5}
              className="w-full"
              data-testid="slider-quality-threshold"
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>0 — Any</span>
            <span className="text-[var(--color-warning)]">60 — Min</span>
            <span className="text-primary">75 — Recommended</span>
            <span className="text-[var(--color-success)]">90 — Strict</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Stories below this score will show quality warnings and be flagged during export.
          </p>
        </div>
      </SettingsSection>

      <SettingsSection title="Workflow" onSave={() => save('Workflow')}>
        {[
          {
            id: 'dev-review',
            label: 'Developer Review Required',
            desc: 'Require developer review before stories can be exported.',
            value: devReviewRequired,
            onChange: setDevReviewRequired,
          },
          {
            id: 'auto-questions',
            label: 'Auto-generate Clarification Questions',
            desc: 'Automatically generate questions when starting a new breakdown.',
            value: autoGenerateQuestions,
            onChange: setAutoGenerateQuestions,
          },
          {
            id: 'readiness-warnings',
            label: 'Show Readiness Warnings',
            desc: 'Display quality warnings on story cards and in the quality panel.',
            value: showReadinessWarnings,
            onChange: setShowReadinessWarnings,
          },
        ].map(({ id, label, desc, value, onChange }) => (
          <div key={id} className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Label htmlFor={id} className="text-xs font-medium cursor-pointer">{label}</Label>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
            <Switch
              id={id}
              checked={value}
              onCheckedChange={onChange}
              data-testid={`switch-${id}`}
            />
          </div>
        ))}
      </SettingsSection>
    </div>
  );
}
