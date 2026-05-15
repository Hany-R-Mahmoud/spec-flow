import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Copy, RotateCcw, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  STEP_SKILL_PHASES,
  useStepSkills,
  validateStepSkill,
  type StepSkillPhase,
} from '@/lib/step-skills';
import { useSessionStore } from '@/store/session-store';

export function StepSkillsSection() {
  const { toast } = useToast();
  const { state: sessionState } = useSessionStore();
  const {
    state,
    getSkill,
    saveCustomSkill,
    duplicateDefaultSkill,
    assignDefaultSkill,
    resetCustomSkill,
  } = useStepSkills();
  const [phase, setPhase] = useState<StepSkillPhase>('clarification');
  const activeSkill = getSkill(phase);
  const customSkill = state.customSkills[phase];
  const aiEnabled = Boolean(sessionState.aiCapability?.canEditSkills);
  const [name, setName] = useState(activeSkill.name);
  const [content, setContent] = useState(activeSkill.content);
  const warnings = useMemo(() => validateStepSkill(content), [content]);

  useEffect(() => {
    setName(activeSkill.name);
    setContent(activeSkill.content);
  }, [activeSkill.content, activeSkill.name]);

  const save = () => {
    if (!aiEnabled) {
      return;
    }
    saveCustomSkill(phase, { name, content });
    toast({
      title: 'Step skill saved',
      description: `${STEP_SKILL_PHASES.find((item) => item.phase === phase)?.label} now uses the custom skill.`,
    });
  };

  const duplicate = () => {
    if (!aiEnabled) {
      return;
    }
    duplicateDefaultSkill(phase);
    toast({
      title: 'Custom skill created',
      description: 'Default skill copied for editing.',
    });
  };

  const useDefault = () => {
    if (!aiEnabled) {
      return;
    }
    assignDefaultSkill(phase);
    toast({
      title: 'Default assigned',
      description: 'This phase now uses the default skill.',
    });
  };

  const reset = () => {
    if (!aiEnabled) {
      return;
    }
    resetCustomSkill(phase);
    toast({
      title: 'Custom skill reset',
      description: 'Custom copy removed for this phase.',
    });
  };

  return (
    <div className="bg-card border border-border rounded-md overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted flex items-center justify-between gap-3">
        <div>
          <span className="text-sm font-semibold text-foreground">Step Skills</span>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {aiEnabled
              ? 'Edit the behavior guide used by each AI workflow phase.'
              : 'Connect an AI provider key to customize generation skills.'}
          </p>
        </div>
        <Badge variant={activeSkill.source === 'custom' ? 'default' : 'outline'}>
          {activeSkill.source}
        </Badge>
      </div>

      <div className="grid gap-4 p-4 md:grid-cols-[220px_1fr]">
        <div className="space-y-3">
          <div>
            <Label className="mb-1.5 block text-xs font-medium">Phase</Label>
            <Select value={phase} onValueChange={(value) => setPhase(value as StepSkillPhase)}>
              <SelectTrigger className="h-8 text-xs" data-testid="select-step-skill-phase">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STEP_SKILL_PHASES.map((item) => {
                  const skill = getSkill(item.phase);
                  return (
                    <SelectItem key={item.phase} value={item.phase} className="text-xs">
                      {item.label} - {skill.source}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded border border-border bg-muted/30 p-3 text-xs">
            <div className="font-medium text-foreground">{activeSkill.name}</div>
            <div className="mt-1 text-muted-foreground">Version {activeSkill.version}</div>
            <div className="mt-1 text-muted-foreground">
              Updated {new Date(activeSkill.updatedAt).toLocaleDateString()}
            </div>
          </div>

          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-full justify-start text-xs"
              onClick={duplicate}
              disabled={!aiEnabled}
              data-testid="button-duplicate-step-skill"
            >
              <Copy className="mr-2 h-3.5 w-3.5" />
              Duplicate Default
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-full justify-start text-xs"
              onClick={useDefault}
              disabled={!aiEnabled}
              data-testid="button-use-default-step-skill"
            >
              <RotateCcw className="mr-2 h-3.5 w-3.5" />
              Use Default
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-full justify-start text-xs"
              onClick={reset}
              disabled={!aiEnabled || !customSkill}
              data-testid="button-reset-step-skill"
            >
              <RotateCcw className="mr-2 h-3.5 w-3.5" />
              Delete Custom
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <Label className="mb-1.5 block text-xs font-medium">Skill Name</Label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={!aiEnabled}
              className="h-8 text-xs"
              data-testid="input-step-skill-name"
            />
          </div>

          <div>
            <Label className="mb-1.5 block text-xs font-medium">Skill Instructions</Label>
            <Textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              disabled={!aiEnabled}
              className="min-h-[320px] resize-y font-mono text-xs leading-relaxed"
              data-testid="textarea-step-skill-content"
            />
          </div>

          {warnings.length > 0 ? (
            <div className="rounded border border-[var(--color-warning)]/30 bg-[var(--color-warning-soft)] p-3">
              <div className="mb-1 flex items-center gap-2 text-xs font-medium text-[var(--color-warning)]">
                <AlertTriangle className="h-3.5 w-3.5" />
                Skill warnings
              </div>
              <ul className="space-y-1 text-xs text-foreground">
                {warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {aiEnabled
                ? 'Saved skills are validated on the server before live generation runs.'
                : 'Manual mode keeps skills read-only because they only affect AI generation.'}
            </p>
            <Button
              type="button"
              size="sm"
              className="h-8 text-xs"
              onClick={save}
              disabled={!aiEnabled}
              data-testid="button-save-step-skill"
            >
              <Save className="mr-2 h-3.5 w-3.5" />
              Save Skill
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
