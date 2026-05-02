import { useState } from 'react';
import { CheckCircle, Edit3, Save, XCircle } from 'lucide-react';
import { PRDSection } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSessionStore } from '@/store/session-store';

interface PRDPanelProps {
  sections: PRDSection[];
  onGenerateEpics: () => void;
}

export function PRDPanel({ sections, onGenerateEpics }: PRDPanelProps) {
  const { dispatch } = useSessionStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const completedCount = sections.filter(s => s.complete).length;

  const startEdit = (section: PRDSection) => {
    setEditingId(section.id);
    setEditContent(section.content);
  };

  const saveEdit = (section: PRDSection) => {
    dispatch({ type: 'UPDATE_PRD_SECTION', payload: { id: section.id, content: editContent, complete: editContent.trim().length > 0 } });
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Product Requirements Document</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {completedCount}/{sections.length} sections complete — review and edit as needed
          </p>
        </div>
        <Button
          size="sm"
          onClick={onGenerateEpics}
          data-testid="button-generate-epics"
        >
          Generate Epics
        </Button>
      </div>

      <div className="space-y-3">
        {sections.sort((a, b) => a.order - b.order).map(section => {
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
                  <span className={cn('text-xs px-1.5 py-0.5 rounded',
                    section.complete
                      ? 'bg-[var(--color-success-soft)] text-[var(--color-success)]'
                      : 'bg-muted-foreground/10 text-muted-foreground'
                  )}>
                    {section.complete ? 'Complete' : 'Incomplete'}
                  </span>
                </div>
                {!isEditing ? (
                  <button
                    onClick={() => startEdit(section)}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                    data-testid={`button-edit-prd-${section.id}`}
                  >
                    <Edit3 className="w-3 h-3" />
                    Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={cancelEdit} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                    <button onClick={() => saveEdit(section)} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors">
                      <Save className="w-3 h-3" />
                      Save
                    </button>
                  </div>
                )}
              </div>

              <div className="px-4 py-3 bg-card">
                {isEditing ? (
                  <Textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    className="text-xs min-h-[100px] resize-none font-mono"
                    autoFocus
                    data-testid={`textarea-prd-${section.id}`}
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
