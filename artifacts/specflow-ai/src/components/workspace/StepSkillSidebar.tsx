import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, BookOpen, Copy, Pencil, RotateCcw, Save, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  type StepSkillPhase,
  type StepSkill,
  useStepSkills,
  validateStepSkill,
  DEFAULT_STEP_SKILLS,
} from '@/lib/step-skills';

interface StepSkillSidebarProps {
  phase: StepSkillPhase;
  skill: StepSkill;
}

export function StepSkillSidebar({ phase, skill }: StepSkillSidebarProps) {
  const [editing, setEditing] = useState(false);
  const { toast } = useToast();
  const { saveCustomSkill, duplicateDefaultSkill, assignDefaultSkill, resetCustomSkill, state } = useStepSkills();
  const customSkill = state.customSkills[phase];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(skill.name);
  const [content, setContent] = useState(skill.content);
  const warnings = useMemo(() => editing ? validateStepSkill(content) : [], [content, editing]);

  useEffect(() => {
    setName(skill.name);
    setContent(skill.content);
    setEditing(false);
  }, [phase, skill.id]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      setContent(text);
      const baseName = file.name.replace(/\.(md|txt|markdown)$/i, '');
      if (baseName && baseName !== name) setName(baseName);
      setEditing(true);
      toast({ title: 'File loaded', description: `${file.name} imported. Review and save.` });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const save = () => {
    saveCustomSkill(phase, { name, content });
    setEditing(false);
    toast({ title: 'Skill saved', description: `${phase} now uses your custom skill.` });
  };

  const duplicate = () => {
    duplicateDefaultSkill(phase);
    toast({ title: 'Custom copy created', description: 'Default skill duplicated for editing.' });
  };

  const useDefault = () => {
    assignDefaultSkill(phase);
    toast({ title: 'Default restored', description: 'This phase uses the default skill.' });
  };

  const reset = () => {
    resetCustomSkill(phase);
    toast({ title: 'Custom deleted', description: 'Reverted to default skill.' });
  };

  if (editing) {
    return (
      <div className="flex flex-col h-full border-l border-border bg-card">
        <div className="px-3 py-2.5 border-b border-border flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-foreground">Edit Skill</span>
          <button type="button" onClick={() => setEditing(false)} className="text-muted-foreground hover:text-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          <div>
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-7 text-xs mt-1" />
          </div>

          <div>
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Instructions</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[240px] resize-y font-mono text-[11px] leading-relaxed mt-1"
            />
          </div>

          {warnings.length > 0 && (
            <div className="rounded border border-[var(--color-warning)]/30 bg-[var(--color-warning-soft)] p-2 text-[11px]">
              <div className="flex items-center gap-1 text-[var(--color-warning)] font-medium mb-1">
                <AlertTriangle className="w-3 h-3" />
                Warnings
              </div>
              {warnings.map((w) => <div key={w} className="text-foreground">{w}</div>)}
            </div>
          )}

          <Button size="sm" className="w-full h-7 text-xs" onClick={save}>
            <Save className="w-3 h-3 mr-1.5" />
            Save Skill
          </Button>

          <div className="border-t border-border pt-2 space-y-1.5">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground py-1 transition-colors">
              <Upload className="w-3 h-3" /> Upload File (.md, .txt)
            </button>
            <button type="button" onClick={duplicate} className="w-full flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground py-1 transition-colors">
              <Copy className="w-3 h-3" /> Duplicate Default
            </button>
            <button type="button" onClick={useDefault} className="w-full flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground py-1 transition-colors">
              <RotateCcw className="w-3 h-3" /> Use Default
            </button>
            {customSkill && (
              <button type="button" onClick={reset} className="w-full flex items-center gap-2 text-xs text-[var(--color-danger)] hover:text-[var(--color-danger)]/80 py-1 transition-colors">
                <RotateCcw className="w-3 h-3" /> Delete Custom
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept=".md,.txt,.markdown" onChange={handleFileUpload} className="hidden" />
        </div>
      </div>
    );
  }

  // Read-only view
  return (
    <div className="flex flex-col h-full border-l border-border bg-card">
      <div className="px-3 py-2.5 border-b border-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-foreground truncate">{skill.name}</div>
            <div className="text-[10px] text-muted-foreground">
              {skill.source === 'custom' ? 'Custom' : 'Default'} · v{skill.version}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
          >
            <Upload className="w-3 h-3" />
            Upload
          </button>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
          >
            <Pencil className="w-3 h-3" />
            Edit
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept=".md,.txt,.markdown" onChange={handleFileUpload} className="hidden" />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        <div className="text-xs text-muted-foreground leading-relaxed">
          {skill.content.split('\n').map((line, i) => {
            if (line.startsWith('## ')) {
              return <h3 key={i} className="text-[11px] font-semibold text-foreground mt-3 mb-1 first:mt-0">{line.slice(3)}</h3>;
            }
            if (line.startsWith('# ')) {
              return <h2 key={i} className="text-xs font-bold text-foreground mb-1">{line.slice(2)}</h2>;
            }
            if (line.startsWith('- ')) {
              return <div key={i} className="flex items-start gap-1.5 py-0.5"><span className="mt-0.5">•</span><span>{line.slice(2)}</span></div>;
            }
            if (line.trim() === '') return <div key={i} className="h-1.5" />;
            return <p key={i} className="py-0.5">{line}</p>;
          })}
        </div>
      </div>
    </div>
  );
}
