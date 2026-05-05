import React from 'react';
import { Link, useLocation } from 'wouter';
import { Boxes, LayoutDashboard, Plus, FolderKanban, MessageSquare, Download, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: Plus, label: 'New Breakdown', href: '/new' },
    { icon: FolderKanban, label: 'Projects', href: '/projects' },
    { icon: MessageSquare, label: 'Reviews', href: '/reviews' },
    { icon: Download, label: 'Exports', href: '/exports' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <aside className="w-64 border-r border-border bg-sidebar flex-shrink-0 flex flex-col h-full hidden md:flex">
      <div className="p-4 flex items-center gap-2 border-b border-border h-12">
        <Boxes className="w-5 h-5 text-primary" />
        <span className="font-semibold text-sidebar-foreground">SpecFlow AI</span>
      </div>

      <div className="p-4">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Workspace</div>
        <nav className="flex flex-col gap-1" aria-label="Workspace navigation">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "bg-[var(--color-primary-soft)] text-primary shadow-[inset_3px_0_0_hsl(var(--primary))]"
                    : "text-secondary-foreground hover:bg-surface-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-4 h-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
