import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Story, Epic } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Copy, Download, CheckCircle, AlertTriangle, Link2Off } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ReviewStatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { listIntegrationConfigs } from '@workspace/api-client-react';

interface ExportPanelProps {
  epics: Epic[];
  stories: Story[];
}

function storyToMarkdown(story: Story): string {
  return `---
**Issue Type:** Story
**ID:** ${story.id}
**Summary:** ${story.title}

**User Story:**
${story.userStory}

**Description:**
${story.description}

**Acceptance Criteria:**
${story.acceptanceCriteria.map((ac, i) => `${i + 1}. ${ac}`).join('\n')}

**Priority:** ${story.priority}
**Labels:** ${story.labels.join(', ') || 'None'}
**Components:** ${story.components.join(', ') || 'None'}
**Dependencies:** ${story.dependencies.join(', ') || 'None'}
**Reviewer Status:** ${story.reviewStatus}
**Readiness Score:** ${story.readinessScore.total}/100 — ${story.readinessScore.label}
---`;
}

function storiesToCSVRow(story: Story): string {
  const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
  return [
    escape(story.id),
    escape('Story'),
    escape(story.title),
    escape(story.userStory),
    escape(story.acceptanceCriteria.join(' | ')),
    escape(story.priority),
    escape(story.labels.join(', ')),
    escape(story.components.join(', ')),
    escape(story.dependencies.join(', ')),
    escape(story.reviewStatus),
    story.readinessScore.total.toString(),
  ].join(',');
}

const CSV_HEADER = 'ID,Issue Type,Summary,Description,Acceptance Criteria,Priority,Labels,Components,Dependencies,Reviewer Status,Readiness Score';

export function ExportPanel({ epics, stories }: ExportPanelProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeEpic, setActiveEpic] = useState<string>('all');
  const [jiraConnectionState, setJiraConnectionState] = useState<{
    status: 'loading' | 'connected' | 'disabled' | 'error';
    message: string;
  }>({
    status: 'loading',
    message: 'Checking Jira connection state...',
  });

  const readyStories = stories.filter(s => s.readinessScore.total >= 90 || s.reviewStatus === 'approved');
  const reviewStories = stories.filter(s => s.readinessScore.total < 90 && s.reviewStatus !== 'approved');

  const filteredStories = activeEpic === 'all' ? stories : stories.filter(s => s.epicId === activeEpic);

  const markdownOutput = epics.map(epic => {
    const epicStories = filteredStories.filter(s => s.epicId === epic.id);
    if (epicStories.length === 0) return '';
    return `# Epic: ${epic.title}\n\n${epicStories.map(storyToMarkdown).join('\n\n')}`;
  }).filter(Boolean).join('\n\n---\n\n');

  const csvOutput = [CSV_HEADER, ...filteredStories.map(storiesToCSVRow)].join('\n');
  const jsonOutput = JSON.stringify(filteredStories, null, 2);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied', description: `${label} copied to clipboard.` });
  };

  const download = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Download started', description: filename });
  };

  useEffect(() => {
    let cancelled = false;

    void listIntegrationConfigs()
      .then((response) => {
        if (cancelled) {
          return;
        }

        const jira = response.integrations.find((integration) => integration.integrationType === 'jira');

        if (!jira) {
          setJiraConnectionState({
            status: 'disabled',
            message: 'Jira integration is not configured for this workspace.',
          });
          return;
        }

        if (jira.enabled && jira.configured) {
          setJiraConnectionState({
            status: 'connected',
            message: 'Jira integration is configured and ready for export.',
          });
          return;
        }

        setJiraConnectionState({
          status: 'disabled',
          message: jira.enabled
            ? 'Jira integration is enabled but not fully configured yet.'
            : 'Jira integration is disabled. Open settings to configure it.',
        });
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setJiraConnectionState({
          status: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Unable to load Jira connection state.',
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Jira Export</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {readyStories.length} ready · {reviewStories.length} need review · {stories.length} total
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-md border border-border bg-muted/40 px-3 py-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {jiraConnectionState.status === 'connected' ? (
                <CheckCircle className="w-4 h-4 text-[var(--color-success)]" />
              ) : jiraConnectionState.status === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-[var(--color-danger)]" />
              ) : (
                <Link2Off className="w-4 h-4 text-muted-foreground" />
              )}
              <span
                className={cn(
                  'text-xs font-semibold',
                  jiraConnectionState.status === 'connected'
                    ? 'text-[var(--color-success)]'
                    : jiraConnectionState.status === 'error'
                      ? 'text-[var(--color-danger)]'
                      : 'text-muted-foreground',
                )}
              >
                {jiraConnectionState.status === 'connected'
                  ? 'Jira connected'
                  : jiraConnectionState.status === 'error'
                    ? 'Jira unavailable'
                    : 'Jira not connected'}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {jiraConnectionState.message}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7 shrink-0"
            onClick={() => setLocation('/settings')}
            disabled={jiraConnectionState.status === 'loading' || jiraConnectionState.status === 'error'}
            title={jiraConnectionState.status === 'error' ? jiraConnectionState.message : 'Open Jira settings'}
            data-testid="button-connect-jira"
          >
            {jiraConnectionState.status === 'connected' ? 'Manage Jira' : 'Open Settings'}
          </Button>
        </div>
      </div>

      {/* Epic filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Filter by epic:</span>
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setActiveEpic('all')}
            className={cn('text-xs px-2 py-1 rounded transition-colors',
              activeEpic === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            All ({stories.length})
          </button>
          {epics.map(epic => {
            const count = stories.filter(s => s.epicId === epic.id).length;
            return (
              <button
                key={epic.id}
                onClick={() => setActiveEpic(epic.id)}
                className={cn('text-xs px-2 py-1 rounded transition-colors',
                  activeEpic === epic.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {epic.title} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Ready / Needs Review summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="border border-green-200 bg-[var(--color-success-soft)] rounded-md px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-[var(--color-success)]" />
            <span className="text-xs font-semibold text-[var(--color-success)]">Ready for Jira ({readyStories.length})</span>
          </div>
          <p className="text-xs text-muted-foreground">Stories with score ≥90 or developer approved</p>
        </div>
        <div className="border border-yellow-200 bg-[var(--color-warning-soft)] rounded-md px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-[var(--color-warning)]" />
            <span className="text-xs font-semibold text-[var(--color-warning)]">Needs Review ({reviewStories.length})</span>
          </div>
          <p className="text-xs text-muted-foreground">Stories that require refinement before export</p>
        </div>
      </div>

      <Tabs defaultValue="markdown">
        <div className="flex items-center justify-between mb-3">
          <TabsList className="h-8">
            <TabsTrigger value="markdown" className="text-xs">Markdown</TabsTrigger>
            <TabsTrigger value="csv" className="text-xs">CSV Preview</TabsTrigger>
            <TabsTrigger value="json" className="text-xs">JSON Preview</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => copy(markdownOutput, 'All Jira-ready stories')} data-testid="button-copy-all">
              <Copy className="w-3 h-3 mr-1" />
              Copy All
            </Button>
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => download(jsonOutput, 'specflow-export.json', 'application/json')}>
              <Download className="w-3 h-3 mr-1" />
              JSON
            </Button>
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => download(csvOutput, 'specflow-export.csv', 'text/csv')}>
              <Download className="w-3 h-3 mr-1" />
              CSV
            </Button>
          </div>
        </div>

        <TabsContent value="markdown">
          <div className="space-y-4">
            {epics.map(epic => {
              const epicStories = filteredStories.filter(s => s.epicId === epic.id);
              if (epicStories.length === 0) return null;
              return (
                <div key={epic.id} className="border border-border rounded-md overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-border">
                    <span className="text-xs font-semibold text-foreground">{epic.title}</span>
                    <button
                      onClick={() => copy(epicStories.map(storyToMarkdown).join('\n\n'), `Epic: ${epic.title}`)}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      Copy Epic
                    </button>
                  </div>
                  <div className="divide-y divide-border">
                    {epicStories.map(story => (
                      <div key={story.id} className="px-4 py-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-mono text-muted-foreground">{story.id}</span>
                          <span className="text-xs font-medium text-foreground">{story.title}</span>
                          <PriorityBadge priority={story.priority} />
                          <ReviewStatusBadge status={story.reviewStatus} />
                          <span className={cn('text-xs font-semibold ml-auto',
                            story.readinessScore.total >= 90 ? 'text-[var(--color-success)]' :
                            story.readinessScore.total >= 75 ? 'text-primary' : 'text-[var(--color-warning)]'
                          )}>
                            {story.readinessScore.total}/100
                          </span>
                          <button
                            onClick={() => copy(storyToMarkdown(story), story.id)}
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <pre className="text-xs text-muted-foreground bg-muted px-3 py-2 rounded whitespace-pre-wrap font-sans leading-relaxed overflow-x-auto">
                          {storyToMarkdown(story)}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="csv">
          <div className="border border-border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted border-b border-border">
                    {CSV_HEADER.split(',').map(h => (
                      <th key={h} className="text-left px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredStories.map(story => (
                    <tr key={story.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-3 py-2 font-mono">{story.id}</td>
                      <td className="px-3 py-2">Story</td>
                      <td className="px-3 py-2 max-w-[200px] truncate">{story.title}</td>
                      <td className="px-3 py-2 max-w-[200px] truncate">{story.userStory}</td>
                      <td className="px-3 py-2 max-w-[150px] truncate">{story.acceptanceCriteria.join(' | ')}</td>
                      <td className="px-3 py-2"><PriorityBadge priority={story.priority} /></td>
                      <td className="px-3 py-2">{story.labels.join(', ')}</td>
                      <td className="px-3 py-2">{story.components.join(', ')}</td>
                      <td className="px-3 py-2">{story.dependencies.join(', ')}</td>
                      <td className="px-3 py-2"><ReviewStatusBadge status={story.reviewStatus} /></td>
                      <td className="px-3 py-2 font-semibold">{story.readinessScore.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="json">
          <div className="relative border border-border rounded-md overflow-hidden">
            <button
              onClick={() => copy(jsonOutput, 'JSON export')}
              className="absolute top-2 right-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 bg-card px-2 py-1 rounded border border-border"
            >
              <Copy className="w-3 h-3" />
              Copy
            </button>
            <pre className="text-xs text-foreground bg-muted p-4 overflow-x-auto max-h-[500px] leading-relaxed font-mono">
              {jsonOutput}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
