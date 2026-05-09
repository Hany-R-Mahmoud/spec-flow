import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Download, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSessionStore } from '@/store/session-store';
import { getExportPackage } from '@workspace/api-client-react';

function slugifyFilename(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'export';
}

function escapeCsv(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function escapeMarkdownCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function buildMarkdown(detail: Awaited<ReturnType<typeof getExportPackage>>): string {
  const { exportPackage, items } = detail;

  const rows = items.map((item) => [
    item.storyId,
    item.epicId,
    item.title,
    item.priority,
    String(item.readinessScore),
    item.reviewStatus,
    item.jiraKey ?? '',
    item.githubIssueUrl ?? '',
  ]);

  return [
    `# Export Package: ${exportPackage.sessionName}`,
    '',
    `- Package ID: ${exportPackage.id}`,
    `- Session ID: ${exportPackage.sessionId}`,
    `- Date: ${new Date(exportPackage.date).toISOString()}`,
    `- Format: ${exportPackage.format.toUpperCase()}`,
    `- Status: ${exportPackage.status}`,
    `- Epics: ${exportPackage.epicCount}`,
    `- Stories: ${exportPackage.storyCount}`,
    `- Average Readiness: ${exportPackage.avgReadiness}/100`,
    '',
    '## Items',
    '',
    '| Story ID | Epic ID | Title | Priority | Readiness | Review Status | Jira Key | GitHub URL |',
    '|---|---|---|---:|---:|---|---|---|',
    ...rows.map((row) => `| ${row.map((value) => escapeMarkdownCell(value || '—')).join(' | ')} |`),
  ].join('\n');
}

function buildCsv(detail: Awaited<ReturnType<typeof getExportPackage>>): string {
  const { exportPackage, items } = detail;
  const header = [
    'Export Package ID',
    'Session Name',
    'Story ID',
    'Epic ID',
    'Title',
    'Priority',
    'Readiness Score',
    'Review Status',
    'Jira Key',
    'GitHub URL',
  ];

  const rows = items.map((item) => [
    exportPackage.id,
    exportPackage.sessionName,
    item.storyId,
    item.epicId,
    item.title,
    item.priority,
    String(item.readinessScore),
    item.reviewStatus,
    item.jiraKey ?? '',
    item.githubIssueUrl ?? '',
  ]);

  return [header.map(escapeCsv).join(','), ...rows.map((row) => row.map(escapeCsv).join(','))].join('\n');
}

function buildJson(detail: Awaited<ReturnType<typeof getExportPackage>>): string {
  return JSON.stringify(detail, null, 2);
}

function triggerFileDownload(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noreferrer';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function ExportsPage() {
  const { toast } = useToast();
  const { state } = useSessionStore();
  const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'partial' | 'draft'>('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const filtered = state.exportPackages.filter(pkg =>
    filterStatus === 'all' || pkg.status === filterStatus
  );

  const download = async (pkg: typeof state.exportPackages[number]) => {
    setDownloadingId(pkg.id);

    try {
      const detail = await getExportPackage(pkg.id);
      const baseName = `${slugifyFilename(detail.exportPackage.sessionName)}-${detail.exportPackage.id}`;

      if (detail.exportPackage.format === 'csv') {
        triggerFileDownload(buildCsv(detail), `${baseName}.csv`, 'text/csv');
      } else if (detail.exportPackage.format === 'markdown') {
        triggerFileDownload(buildMarkdown(detail), `${baseName}.md`, 'text/markdown');
      } else {
        triggerFileDownload(buildJson(detail), `${baseName}.json`, 'application/json');
      }

      toast({
        title: 'Download ready',
        description: `${detail.exportPackage.sessionName} export saved locally.`,
      });
    } catch (error) {
      toast({
        title: 'Download failed',
        description:
          error instanceof Error ? error.message : 'Could not load export package.',
      });
    } finally {
      setDownloadingId(null);
    }
  };

  if (state.isLoading) {
    return (
      <div className="space-y-3">
        <h1 className="text-lg font-semibold text-foreground">Exports</h1>
        <p className="text-xs text-muted-foreground">Loading persisted export history…</p>
      </div>
    );
  }

  if (state.error && state.dataSource === 'api') {
    return (
      <div className="space-y-3">
        <h1 className="text-lg font-semibold text-foreground">Exports</h1>
        <p className="text-xs text-[var(--color-danger)]">{state.error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Exports</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Previous Jira export packages</p>
        <p className="text-xs text-muted-foreground mt-1">History now loads from persisted export package records.</p>
        {state.error && <p className="text-xs text-[var(--color-warning)] mt-1">{state.error}</p>}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'complete', 'partial', 'draft'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={cn('text-xs px-3 py-1.5 rounded border capitalize transition-colors',
              filterStatus === s ? 'border-primary bg-[var(--color-primary-soft)] text-primary' : 'border-border bg-card text-muted-foreground hover:bg-muted'
            )}
          >
            {s} ({s === 'all' ? state.exportPackages.length : state.exportPackages.filter(p => p.status === s).length})
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-md overflow-hidden">
        <table className="w-full" aria-label="Export packages">
          <caption className="sr-only">Export packages with project, date, counts, readiness, format, status, and download action.</caption>
          <thead>
            <tr className="bg-muted border-b border-border">
              {['Project Name', 'Date', 'Epics', 'Stories', 'Avg Readiness', 'Format', 'Status', ''].map(h => (
                <th key={h} scope="col" className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(pkg => (
              <tr key={pkg.id} className="hover:bg-muted/40 transition-colors" data-testid={`export-row-${pkg.id}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs font-medium text-foreground">{pkg.sessionName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{pkg.date}</td>
                <td className="px-4 py-3 text-xs text-foreground font-medium">{pkg.epicCount}</td>
                <td className="px-4 py-3 text-xs text-foreground font-medium">{pkg.storyCount}</td>
                <td className="px-4 py-3">
                  <span className={cn('text-sm font-bold',
                    pkg.avgReadiness >= 90 ? 'text-[var(--color-success)]' :
                    pkg.avgReadiness >= 75 ? 'text-primary' :
                    pkg.avgReadiness >= 60 ? 'text-[var(--color-warning)]' : 'text-[var(--color-danger)]'
                  )}>
                    {pkg.avgReadiness}
                  </span>
                  <span className="text-xs text-muted-foreground">/100</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded uppercase">{pkg.format}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs px-2 py-0.5 rounded font-medium',
                    pkg.status === 'complete' ? 'bg-[var(--color-success-soft)] text-[var(--color-success)]' :
                    pkg.status === 'partial' ? 'bg-[var(--color-warning-soft)] text-[var(--color-warning)]' :
                    'bg-muted text-muted-foreground'
                  )}>
                    {pkg.status.charAt(0).toUpperCase() + pkg.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => void download(pkg)}
                    className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={downloadingId === pkg.id}
                    data-testid={`button-download-${pkg.id}`}
                    aria-label={`Download ${pkg.sessionName} ${pkg.format.toUpperCase()} export package`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    {downloadingId === pkg.id ? 'Downloading…' : 'Download'}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-xs text-muted-foreground">
                  No export packages match this filter yet. Switch status filters or finish a workspace export to populate history.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
