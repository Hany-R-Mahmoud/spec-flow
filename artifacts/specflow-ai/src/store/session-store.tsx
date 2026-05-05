import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  createSession as createSessionRequest,
  getSettings,
  listExportPackages,
  listSessions,
  updateSession,
  updateSessionArtifacts,
  updateSettings,
} from '@workspace/api-client-react';
import type {
  ClarificationQuestion,
  Epic,
  ExportPackage,
  Phase,
  PRDSection,
  ProjectSession,
  Story,
  WorkspaceSettings,
} from '@/lib/types';
import { allSessions, mockExportPackages, mockSettings } from '@/lib/sample-data';

interface State {
  sessions: ProjectSession[];
  activeSessionId: string | null;
  epics: Epic[];
  stories: Story[];
  clarificationQuestions: ClarificationQuestion[];
  prdSections: PRDSection[];
  settings: WorkspaceSettings | null;
  exportPackages: ExportPackage[];
  isLoading: boolean;
  error: string | null;
  dataSource: 'api' | 'demo';
}

type Action =
  | { type: 'SET_ACTIVE_SESSION'; payload: string }
  | { type: 'ADD_SESSION'; payload: ProjectSession }
  | { type: 'UPDATE_SESSION'; payload: Partial<ProjectSession> & { id: string } }
  | { type: 'SET_PHASE'; payload: { sessionId: string; phase: Phase } }
  | { type: 'UPDATE_STORY'; payload: Story }
  | { type: 'UPDATE_CLARIFICATION'; payload: { id: string; answer: string; skipped?: boolean } }
  | { type: 'UPDATE_PRD_SECTION'; payload: { id: string; content: string; complete: boolean } };

type CreateSessionInput = {
  name: string;
  inputType: string;
  outputDepth: string;
  jiraKey?: string;
  targetUsers: string[];
  businessGoal?: string;
  knownConstraints?: string;
  labels: string[];
  rawInput: string;
};

const INITIAL_STATE: State = {
  sessions: [],
  activeSessionId: null,
  epics: [],
  stories: [],
  clarificationQuestions: [],
  prdSections: [],
  settings: null,
  exportPackages: [],
  isLoading: true,
  error: null,
  dataSource: 'api',
};

function deriveState(
  sessions: ProjectSession[],
  activeSessionId: string | null,
  settings: WorkspaceSettings | null,
  exportPackages: ExportPackage[],
  isLoading: boolean,
  error: string | null,
  dataSource: 'api' | 'demo',
): State {
  const nextActiveSessionId =
    activeSessionId && sessions.some((session) => session.id === activeSessionId)
      ? activeSessionId
      : sessions[0]?.id ?? null;
  const activeSession =
    sessions.find((session) => session.id === nextActiveSessionId) ?? null;

  return {
    sessions,
    activeSessionId: nextActiveSessionId,
    epics: sessions.flatMap((session) => session.epics),
    stories: sessions.flatMap((session) => session.stories),
    clarificationQuestions: activeSession?.clarificationQuestions ?? [],
    prdSections: activeSession?.prdSections ?? [],
    settings,
    exportPackages,
    isLoading,
    error,
    dataSource,
  };
}

function replaceSession(
  sessions: ProjectSession[],
  updatedSession: ProjectSession,
): ProjectSession[] {
  return sessions.map((session) =>
    session.id === updatedSession.id ? updatedSession : session,
  );
}

const SessionContext = createContext<{
  state: State;
  dispatch: (action: Action) => void;
  createSession: (input: CreateSessionInput) => Promise<ProjectSession>;
  saveSettings: (input: WorkspaceSettings) => Promise<WorkspaceSettings>;
  reload: () => Promise<void>;
} | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(INITIAL_STATE);

  const load = useCallback(async () => {
    setState((current) => ({ ...current, isLoading: true, error: null }));

    try {
      const [sessionsResponse, settingsResponse, exportPackagesResponse] =
        await Promise.all([
          listSessions(),
          getSettings(),
          listExportPackages(),
        ]);

      setState((current) =>
        deriveState(
          sessionsResponse.sessions,
          current.activeSessionId,
          settingsResponse,
          exportPackagesResponse.exportPackages,
          false,
          null,
          'api',
        ),
      );
    } catch (error) {
      setState((current) =>
        deriveState(
          allSessions,
          current.activeSessionId,
          mockSettings,
          mockExportPackages,
          false,
          error instanceof Error
            ? `Demo mode active: ${error.message}`
            : 'Demo mode active until the API base URL is available.',
          'demo',
        ),
      );
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const syncSessionSummary = useCallback(
    async (
      sessionId: string,
      patch: Partial<ProjectSession> & { id: string },
    ) => {
      try {
        const updatedSession = await updateSession(sessionId, patch);
        setState((current) =>
          deriveState(
            replaceSession(current.sessions, updatedSession),
            current.activeSessionId,
            current.settings,
            current.exportPackages,
            false,
            null,
            current.dataSource,
          ),
        );
      } catch (error) {
        setState((current) => ({
          ...current,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to save session changes.',
        }));
      }
    },
    [],
  );

  const syncSessionArtifacts = useCallback(
    async (
      sessionId: string,
      patch: Partial<
        Pick<
          ProjectSession,
          'clarificationQuestions' | 'prdSections' | 'epics' | 'stories'
        >
      >,
    ) => {
      try {
        const updatedSession = await updateSessionArtifacts(sessionId, patch);
        setState((current) =>
          deriveState(
            replaceSession(current.sessions, updatedSession),
            current.activeSessionId,
            current.settings,
            current.exportPackages,
            false,
            null,
            'api',
          ),
        );
      } catch (error) {
        setState((current) => ({
          ...current,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to save workflow artifact changes.',
        }));
      }
    },
    [],
  );

  const dispatch = useCallback(
    (action: Action) => {
      if (action.type === 'SET_ACTIVE_SESSION') {
        setState((current) =>
          deriveState(
            current.sessions,
            action.payload,
            current.settings,
            current.exportPackages,
            current.isLoading,
            current.error,
            current.dataSource,
          ),
        );
        return;
      }

      if (action.type === 'ADD_SESSION') {
        setState((current) =>
          deriveState(
            [...current.sessions, action.payload],
            action.payload.id,
            current.settings,
            current.exportPackages,
            false,
            null,
            current.dataSource,
          ),
        );
        return;
      }

      if (action.type === 'UPDATE_SESSION') {
        setState((current) => {
          const nextSessions = current.sessions.map((session) =>
            session.id === action.payload.id
              ? { ...session, ...action.payload }
              : session,
          );

          return deriveState(
            nextSessions,
            current.activeSessionId,
            current.settings,
            current.exportPackages,
            false,
            null,
            current.dataSource,
          );
        });

        if (state.dataSource === 'api') {
          void syncSessionSummary(action.payload.id, action.payload);
        }
        return;
      }

      if (action.type === 'SET_PHASE') {
        const currentSession = state.sessions.find(
          (session) => session.id === action.payload.sessionId,
        );

        if (!currentSession) {
          return;
        }

        const phases = {
          ...currentSession.phases,
          [action.payload.phase]: 'in-progress' as const,
        };

        dispatch({
          type: 'UPDATE_SESSION',
          payload: {
            id: action.payload.sessionId,
            currentPhase: action.payload.phase,
            phases,
          },
        });
        return;
      }

      if (action.type === 'UPDATE_STORY') {
        const activeSessionId = state.activeSessionId;
        if (!activeSessionId) {
          return;
        }

        setState((current) => {
          const nextSessions = current.sessions.map((session) =>
            session.id === activeSessionId
              ? {
                  ...session,
                  stories: session.stories.map((story) =>
                    story.id === action.payload.id ? action.payload : story,
                  ),
                }
              : session,
          );

          return deriveState(
            nextSessions,
            current.activeSessionId,
            current.settings,
            current.exportPackages,
            false,
            null,
            current.dataSource,
          );
        });

        const activeSession = state.sessions.find(
          (session) => session.id === activeSessionId,
        );
        if (activeSession) {
          const nextStories = activeSession.stories.map((story) =>
            story.id === action.payload.id ? action.payload : story,
          );
          if (state.dataSource === 'api') {
            void syncSessionArtifacts(activeSessionId, { stories: nextStories });
          }
        }
        return;
      }

      if (action.type === 'UPDATE_CLARIFICATION') {
        const activeSession = state.sessions.find(
          (session) => session.id === state.activeSessionId,
        );
        if (!activeSession) {
          return;
        }

        const nextQuestions = activeSession.clarificationQuestions.map((question) =>
          question.id === action.payload.id
            ? {
                ...question,
                answer: action.payload.answer,
                skipped: action.payload.skipped ?? question.skipped,
              }
            : question,
        );

        setState((current) => {
          const nextSessions = current.sessions.map((session) =>
            session.id === activeSession.id
              ? { ...session, clarificationQuestions: nextQuestions }
              : session,
          );

          return deriveState(
            nextSessions,
            current.activeSessionId,
            current.settings,
            current.exportPackages,
            false,
            null,
            current.dataSource,
          );
        });

        if (state.dataSource === 'api') {
          void syncSessionArtifacts(activeSession.id, {
            clarificationQuestions: nextQuestions,
          });
        }
        return;
      }

      if (action.type === 'UPDATE_PRD_SECTION') {
        const activeSession = state.sessions.find(
          (session) => session.id === state.activeSessionId,
        );
        if (!activeSession) {
          return;
        }

        const nextSections = activeSession.prdSections.map((section) =>
          section.id === action.payload.id
            ? {
                ...section,
                content: action.payload.content,
                complete: action.payload.complete,
              }
            : section,
        );

        setState((current) => {
          const nextSessions = current.sessions.map((session) =>
            session.id === activeSession.id
              ? { ...session, prdSections: nextSections }
              : session,
          );

          return deriveState(
            nextSessions,
            current.activeSessionId,
            current.settings,
            current.exportPackages,
            false,
            null,
            current.dataSource,
          );
        });

        if (state.dataSource === 'api') {
          void syncSessionArtifacts(activeSession.id, { prdSections: nextSections });
        }
      }
    },
    [state, syncSessionArtifacts, syncSessionSummary],
  );

  const createSession = useCallback(
    async (input: CreateSessionInput) => {
      if (state.dataSource === 'demo') {
        const createdAt = new Date().toISOString();
        const createdSession: ProjectSession = {
          id: `demo-session-${Date.now()}`,
          projectId: `demo-project-${Date.now()}`,
          name: input.name,
          inputType: input.inputType,
          outputDepth: input.outputDepth,
          jiraKey: (input.jiraKey || state.settings?.jiraKey || 'DEMO').toUpperCase(),
          targetUsers: input.targetUsers,
          businessGoal: input.businessGoal || '',
          knownConstraints: input.knownConstraints || '',
          labels: input.labels,
          rawInput: input.rawInput,
          currentPhase: 'clarification',
          phases: {
            intake: 'complete',
            clarification: 'in-progress',
            prd: 'not-started',
            epics: 'not-started',
            stories: 'not-started',
            quality: 'not-started',
            devReview: 'not-started',
            export: 'not-started',
          },
          createdAt,
          updatedAt: createdAt,
          clarificationQuestions: [
            {
              id: 'demo-question-1',
              group: 'Scope',
              text: 'What user outcome matters most?',
              required: true,
              answer: '',
              skipped: false,
            },
          ],
          prdSections: [
            {
              id: 'demo-prd-1',
              title: 'Problem Statement',
              content: '',
              complete: false,
              order: 1,
            },
          ],
          epics: [],
          stories: [],
        };

        setState((current) =>
          deriveState(
            [...current.sessions, createdSession],
            createdSession.id,
            current.settings,
            current.exportPackages,
            false,
            current.error,
            'demo',
          ),
        );

        return createdSession;
      }

      const createdSession = await createSessionRequest(input);

      setState((current) =>
        deriveState(
          [...current.sessions, createdSession],
          createdSession.id,
          current.settings,
          current.exportPackages,
          false,
          null,
          'api',
        ),
      );

      return createdSession;
    },
    [state.dataSource, state.settings],
  );

  const saveSettings = useCallback(async (input: WorkspaceSettings) => {
    if (state.dataSource === 'demo') {
      const updatedSettings = {
        ...input,
        updatedAt: new Date().toISOString(),
      };

      setState((current) => ({
        ...current,
        settings: updatedSettings,
        error: current.error,
        dataSource: 'demo',
      }));

      return updatedSettings;
    }

    const updatedSettings = await updateSettings(input);

    setState((current) => ({
      ...current,
      settings: updatedSettings,
      error: null,
      dataSource: 'api',
    }));

    return updatedSettings;
  }, [state.dataSource]);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      createSession,
      saveSettings,
      reload: load,
    }),
    [state, dispatch, createSession, saveSettings, load],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSessionStore() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSessionStore must be used within a SessionProvider');
  }
  return context;
}
