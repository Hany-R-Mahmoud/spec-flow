import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { Bell, FolderKanban, LayoutDashboard, MessageSquare, Plus, Search, Settings, Download } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '@/components/ui/command';
import { useSessionStore } from '@/store/session-store';
import { ThemeModeToggle } from '@/components/shared/ThemeModeToggle';
import { DensityToggle } from '@/components/shared/DensityToggle';
import { useAuth } from '@/components/providers/auth-provider';
import { getAuthInitials } from '@/lib/supabase-auth';

const NAV_COMMANDS = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard, shortcut: 'G D' },
  { label: 'New Breakdown', href: '/new', icon: Plus, shortcut: 'G N' },
  { label: 'Projects', href: '/projects', icon: FolderKanban, shortcut: 'G P' },
  { label: 'Reviews', href: '/reviews', icon: MessageSquare, shortcut: 'G R' },
  { label: 'Exports', href: '/exports', icon: Download, shortcut: 'G E' },
  { label: 'Settings', href: '/settings', icon: Settings, shortcut: 'G S' },
];

export function Topbar() {
  const [, setLocation] = useLocation();
  const { state, dispatch } = useSessionStore();
  const { user, displayName, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const currentWorkspace = state.settings?.workspaceName ?? 'Workspace';
  const currentSession = state.sessions.find((session) => session.id === state.activeSessionId) ?? null;
  const userInitials = getAuthInitials(user);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const sessionCommands = useMemo(() => {
    return state.sessions.map((session) => ({
      id: session.id,
      title: session.name,
      jiraKey: session.jiraKey,
      subtitle: `${session.currentPhase} phase`,
    }));
  }, [state.sessions]);

  const navigate = (href: string) => {
    setOpen(false);
    setLocation(href);
  };

  const openProjects = () => {
    navigate('/projects');
  };

  const openSession = (sessionId: string) => {
    dispatch({ type: 'SET_ACTIVE_SESSION', payload: sessionId });
    navigate(`/workspace/${sessionId}`);
  };

  return (
    <header
      className="h-14 border-b border-border bg-card flex items-center justify-between flex-shrink-0"
      style={{ paddingInline: 'var(--shell-header-padding)' }}
    >
      <div className="flex-1 min-w-0">
        <button
          type="button"
          onClick={openProjects}
          className="flex min-w-0 flex-col items-start rounded-md px-2 py-1 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Open project switcher"
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Workspace</span>
          <span className="truncate text-sm font-semibold text-foreground">{currentWorkspace}</span>
          <span className="truncate text-[11px] text-muted-foreground">
            {state.sessions.length} sessions · {currentSession?.name ?? 'No active session selected'}
          </span>
        </button>
      </div>

      <div className="flex-1 flex justify-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Search commands, specs, and projects"
          title="Open command menu"
          className="flex h-9 w-full max-w-xl items-center justify-between gap-3 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex min-w-0 items-center gap-2">
            <Search className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">Search sessions, projects, actions</span>
          </span>
          <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="flex-1 flex justify-end items-center gap-3">
        <DensityToggle className="hidden xl:flex" />
        <ThemeModeToggle className="hidden xl:flex" />
        <button
          type="button"
          aria-label="Notifications coming soon"
          title="Notifications coming soon"
          disabled
          className="relative flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground opacity-70"
        >
          <Bell className="w-4 h-4" aria-hidden="true" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Open account menu"
              className="flex h-9 w-9 items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">{userInitials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="space-y-0.5">
                <div className="text-sm font-medium text-foreground">{displayName}</div>
                <div className="text-xs text-muted-foreground">{user?.email ?? 'Signed in user'}</div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate('/settings')}>Workspace Settings</DropdownMenuItem>
            <DropdownMenuItem onSelect={(event) => { event.preventDefault(); void signOut(); }}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search commands, specs, projects, or Jira keys..." />
        <CommandList>
          <CommandEmpty>No matching commands or sessions.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {NAV_COMMANDS.map(({ label, href, icon: Icon, shortcut }) => (
              <CommandItem key={href} value={label} onSelect={() => navigate(href)}>
                <Icon aria-hidden="true" />
                <span>{label}</span>
                <CommandShortcut>{shortcut}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Sessions">
            {sessionCommands.map((session) => (
              <CommandItem
                key={session.id}
                value={`${session.title} ${session.jiraKey} ${session.subtitle}`}
                keywords={[session.jiraKey, session.id, session.subtitle]}
                onSelect={() => openSession(session.id)}
              >
                <FolderKanban aria-hidden="true" />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate">{session.title}</span>
                  <span className="text-xs text-muted-foreground">{session.jiraKey || 'No Jira key'} · {session.subtitle}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
}
