import { useState } from 'react';
import { mockExportPackages } from '@/lib/sample-data';
import { cn } from '@/lib/utils';
import { Download, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ExportsPage() {
  const { toast } = useToast();
  const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'partial' | 'draft'>('all');

  const filtered = mockExportPackages.filter(pkg =>
    filterStatus === 'all' || pkg.status === filterStatus
  );

  const download = (pkg: typeof mockExportPackages[0]) => {
    toast({ title: 'Download started', description: `${pkg.sessionName} export (${pkg.format.toUpperCase()})` });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Exports</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Previous Jira export packages</p>
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
            {s} ({s === 'all' ? mockExportPackages.length : mockExportPackages.filter(p => p.status === s).length})
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-md overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted border-b border-border">
              {['Project Name', 'Date', 'Epics', 'Stories', 'Avg Readiness', 'Format', 'Status', ''].map(h => (
                <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
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
                    onClick={() => download(pkg)}
                    className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                    data-testid={`button-download-${pkg.id}`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
