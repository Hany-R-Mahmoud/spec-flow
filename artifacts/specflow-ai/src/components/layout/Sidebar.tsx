import React from 'react';
import { Link, useLocation } from 'wouter';
import { Boxes, LayoutDashboard, Plus, FolderKanban, MessageSquare, Download, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
}

export function Sidebar({ collapsed }: SidebarProps) {
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
    <aside
      className={cn(
        "border-r border-border bg-sidebar flex-shrink-0 flex flex-col h-full hidden md:flex transition-[width] duration-200 ease-out",
        collapsed ? "md:w-16" : "md:w-64",
      )}
      style={{ paddingInline: 'var(--shell-sidebar-padding)' }}
    >
      <div className={cn("flex h-12 items-center border-b border-border", collapsed ? "justify-center" : "gap-2")}>
        <Boxes className="w-5 h-5 text-primary" />
        {!collapsed && <span className="font-semibold text-sidebar-foreground">SpecFlow AI</span>}
      </div>

      <div className="py-4">
        {!collapsed && <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Workspace</div>}
        <nav className="flex flex-col gap-1" aria-label="Workspace navigation">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  "relative flex items-center rounded-md py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  collapsed ? "justify-center px-2" : "gap-3 px-3",
                  isActive
                    ? "bg-[var(--color-primary-soft)] text-primary shadow-[inset_3px_0_0_hsl(var(--primary))]"
                    : "text-secondary-foreground hover:bg-surface-muted hover:text-foreground"
                )}
                title={item.label}
              >
                <item.icon className="w-4 h-4" aria-hidden="true" />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
