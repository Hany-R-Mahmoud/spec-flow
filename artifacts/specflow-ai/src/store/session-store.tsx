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
  generateClarification as generateClarificationRequest,
  generateEpics as generateEpicsRequest,
  generatePrd as generatePrdRequest,
  generateQuality as generateQualityRequest,
  generateStories as generateStoriesRequest,
  getAiCapability,
  getSettings,
  listExportPackages,
  listSessions,
  updateSession,
  updateSessionArtifacts,
  updateSettings,
} from '@workspace/api-client-react';
import { getStepSkillSnapshotForPhase, type StepSkillPhase } from '@/lib/step-skills';
import type {
  ClarificationQuestion,
  AiCapability,
  Epic,
  ExportPackage,
  GenerationMode,
  GenerationStatus,
  GenerationStepState,
  Phase,
  PRDSection,
  ProjectSession,
  Story,
  WorkflowGenerationState,
  WorkspaceSettings,
} from '@/lib/types';

interface State {
  sessions: ProjectSession[];
  activeSessionId: string | null;
  epics: Epic[];
  stories: Story[];
  clarificationQuestions: ClarificationQuestion[];
  prdSections: PRDSection[];
  settings: WorkspaceSettings | null;
  aiCapability: AiCapability | null;
  exportPackages: ExportPackage[];
  isLoading: boolean;
  error: string | null;
  dataSource: 'api';
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
  initialArtifacts?:
    | Partial<
        Pick<
          ProjectSession,
          'clarificationQuestions' | 'prdSections' | 'epics' | 'stories'
        >
      >
    | ((
        sessionId: string,
      ) => Partial<
        Pick<
          ProjectSession,
          'clarificationQuestions' | 'prdSections' | 'epics' | 'stories'
        >
      >);
  initialPhase?: Phase;
  initialPhases?: ProjectSession['phases'];
};

type GenerationStepKey = keyof WorkflowGenerationState;

const INITIAL_STATE: State = {
  sessions: [],
  activeSessionId: null,
  epics: [],
  stories: [],
  clarificationQuestions: [],
  prdSections: [],
  settings: null,
  aiCapability: null,
  exportPackages: [],
  isLoading: true,
  error: null,
  dataSource: 'api',
};

function deriveState(
  sessions: ProjectSession[],
  activeSessionId: string | null,
  settings: WorkspaceSettings | null,
  aiCapability: AiCapability | null,
  exportPackages: ExportPackage[],
  isLoading: boolean,
  error: string | null,
  dataSource: 'api',
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
    aiCapability,
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

function createGenerationState(
  mode: GenerationMode = 'live',
): WorkflowGenerationState {
  const createStep = (
    promptVersion: string,
    status: GenerationStatus = 'idle',
  ): GenerationStepState => ({
    status,
    mode,
    promptVersion,
    updatedAt: null,
    errorMessage: null,
  });

  return {
    clarification: createStep('clarification-v1'),
    prd: createStep('prd-v1'),
    epics: createStep('epics-v1'),
    stories: createStep('stories-v1'),
    quality: createStep('quality-v1'),
  };
}

function patchGeneration(
  generation: WorkflowGenerationState,
  step: GenerationStepKey,
  patch: Partial<GenerationStepState>,
): WorkflowGenerationState {
  return {
    ...generation,
    [step]: {
      ...generation[step],
      ...patch,
    },
  };
}

function patchSessionById(
  sessions: ProjectSession[],
  sessionId: string,
  updater: (session: ProjectSession) => ProjectSession,
): ProjectSession[] {
  return sessions.map((session) =>
    session.id === sessionId ? updater(session) : session,
  );
}

const SessionContext = createContext<{
  state: State;
  dispatch: (action: Action) => void;
  createSession: (input: CreateSessionInput) => Promise<ProjectSession>;
  saveWorkflowArtifacts: (
    patch: Partial<
      Pick<
        ProjectSession,
        'clarificationQuestions' | 'prdSections' | 'epics' | 'stories'
      >
    >,
  ) => Promise<ProjectSession | null>;
  saveClarificationQuestions: (
    questions: ClarificationQuestion[],
  ) => Promise<ProjectSession | null>;
  savePrdSections: (sections: PRDSection[]) => Promise<ProjectSession | null>;
  saveStories: (stories: Story[]) => Promise<ProjectSession | null>;
  saveSettings: (input: WorkspaceSettings) => Promise<WorkspaceSettings>;
  refreshAiCapability: () => Promise<AiCapability | null>;
  runGeneration: (
    sessionId: string,
    step: GenerationStepKey,
  ) => Promise<ProjectSession | null>;
  reload: () => Promise<void>;
} | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(INITIAL_STATE);

  const load = useCallback(async () => {
    setState((current) => ({ ...current, isLoading: true, error: null }));

    try {
      const [
        sessionsResponse,
        settingsResponse,
        exportPackagesResponse,
        aiCapabilityResponse,
      ] =
        await Promise.all([
          listSessions(),
          getSettings(),
          listExportPackages(),
          getAiCapability(),
        ]);

      setState((current) =>
        deriveState(
          sessionsResponse.sessions,
          current.activeSessionId,
          settingsResponse,
          aiCapabilityResponse,
          exportPackagesResponse.exportPackages,
          false,
          null,
          'api',
        ),
      );
    } catch (error) {
      setState((current) =>
        deriveState(
          [],
          null,
          null,
          null,
          [],
          false,
          error instanceof Error
            ? error.message
            : 'Unable to load workspace data.',
          'api',
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
            current.aiCapability,
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
            current.aiCapability,
            current.exportPackages,
            false,
            null,
            'api',
          ),
        );
        return updatedSession;
      } catch (error) {
        setState((current) => ({
          ...current,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to save workflow artifact changes.',
        }));
        return null;
      }
    },
    [],
  );

  const saveWorkflowArtifacts = useCallback(
    async (
      patch: Partial<
        Pick<
          ProjectSession,
          'clarificationQuestions' | 'prdSections' | 'epics' | 'stories'
        >
      >,
    ) => {
      const activeSessionId = state.activeSessionId;
      if (!activeSessionId) {
        return null;
      }

      return syncSessionArtifacts(activeSessionId, patch);
    },
    [state.activeSessionId, syncSessionArtifacts],
  );

  const saveClarificationQuestions = useCallback(
    async (questions: ClarificationQuestion[]) => {
      return saveWorkflowArtifacts({ clarificationQuestions: questions });
    },
    [saveWorkflowArtifacts],
  );

  const savePrdSections = useCallback(
    async (sections: PRDSection[]) => {
      return saveWorkflowArtifacts({ prdSections: sections });
    },
    [saveWorkflowArtifacts],
  );

  const saveStories = useCallback(
    async (stories: Story[]) => {
      const activeSessionId = state.activeSessionId;
      if (!activeSessionId) {
        return null;
      }

      return syncSessionArtifacts(activeSessionId, { stories });
    },
    [state.activeSessionId, syncSessionArtifacts],
  );

  const dispatch = useCallback(
    (action: Action) => {
      if (action.type === 'SET_ACTIVE_SESSION') {
        setState((current) =>
          deriveState(
            current.sessions,
            action.payload,
            current.settings,
            current.aiCapability,
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
            current.aiCapability,
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
            current.aiCapability,
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
            current.aiCapability,
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
            current.aiCapability,
            current.exportPackages,
            false,
            null,
            current.dataSource,
          );
        });
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
            current.aiCapability,
            current.exportPackages,
            false,
            null,
            current.dataSource,
          );
        });
      }
    },
    [state, syncSessionArtifacts, syncSessionSummary],
  );

  const createSession = useCallback(
    async (input: CreateSessionInput) => {
      const {
        initialArtifacts,
        initialPhase,
        initialPhases,
        ...createInput
      } = input;
      const createdSession = await createSessionRequest(createInput);
      let nextSession = createdSession;

      const artifactsPatch =
        typeof initialArtifacts === 'function'
          ? initialArtifacts(createdSession.id)
          : initialArtifacts;

      if (artifactsPatch && Object.keys(artifactsPatch).length > 0) {
        nextSession = await updateSessionArtifacts(
          createdSession.id,
          artifactsPatch,
        );
      }

      if (initialPhase || initialPhases) {
        nextSession = await updateSession(createdSession.id, {
          currentPhase: initialPhase ?? nextSession.currentPhase,
          phases: initialPhases ?? nextSession.phases,
        });
      }

      setState((current) =>
        deriveState(
          [...current.sessions, nextSession],
          nextSession.id,
          current.settings,
          current.aiCapability,
          current.exportPackages,
          false,
          null,
          'api',
        ),
      );

      return nextSession;
    },
    [],
  );

  const saveSettings = useCallback(async (input: WorkspaceSettings) => {
    const updatedSettings = await updateSettings(input);

    setState((current) => ({
      ...current,
      settings: updatedSettings,
      error: null,
      dataSource: 'api',
    }));

    return updatedSettings;
  }, []);

  const refreshAiCapability = useCallback(async () => {
    const capability = await getAiCapability();
    setState((current) => ({
      ...current,
      aiCapability: capability,
      error: null,
    }));
    return capability;
  }, []);

  const runGeneration = useCallback(
    async (sessionId: string, step: GenerationStepKey) => {
      const activeSession = state.sessions.find((session) => session.id === sessionId);

      if (!activeSession) {
        return null;
      }

      const capability = await getAiCapability();
      setState((current) => ({
        ...current,
        aiCapability: capability,
        error: null,
      }));

      if (!capability.canGenerate) {
        const message =
          capability.reason ??
          'Connect and validate an AI provider key before running generation.';
        setState((current) => ({
          ...current,
          error: message,
        }));
        return null;
      }

      setState((current) =>
        deriveState(
          patchSessionById(current.sessions, sessionId, (session) => ({
            ...session,
            generation: patchGeneration(
              session.generation ?? createGenerationState('live'),
              step,
              {
                status: 'running',
                errorMessage: null,
                updatedAt: new Date().toISOString(),
                mode: 'live',
              },
            ),
          })),
          current.activeSessionId,
          current.settings,
          capability,
          current.exportPackages,
          false,
          null,
          current.dataSource,
        ),
      );

      try {
        const stepSkill = getStepSkillSnapshotForPhase(step as StepSkillPhase);
        const request = { force: true, stepSkill };
        const updatedSession =
          step === 'clarification'
            ? await generateClarificationRequest(sessionId, request)
            : step === 'prd'
              ? await generatePrdRequest(sessionId, request)
              : step === 'epics'
                ? await generateEpicsRequest(sessionId, request)
                : step === 'stories'
                  ? await generateStoriesRequest(sessionId, request)
                  : await generateQualityRequest(sessionId, request);

        setState((current) =>
          deriveState(
            replaceSession(current.sessions, updatedSession),
            current.activeSessionId,
            current.settings,
            capability,
            current.exportPackages,
            false,
            null,
            'api',
          ),
        );

        return updatedSession;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Generation failed before valid output could be saved.';

        setState((current) =>
          deriveState(
            patchSessionById(current.sessions, sessionId, (session) => ({
              ...session,
              generation: patchGeneration(session.generation, step, {
                status: 'failed',
                errorMessage: message,
                updatedAt: new Date().toISOString(),
              }),
            })),
            current.activeSessionId,
            current.settings,
            current.aiCapability,
            current.exportPackages,
            false,
            message,
            'api',
          ),
        );

        return null;
      }
    },
    [state.sessions],
  );

  const value = useMemo(
    () => ({
      state,
      dispatch,
      createSession,
      saveWorkflowArtifacts,
      saveClarificationQuestions,
      savePrdSections,
      saveStories,
      saveSettings,
      refreshAiCapability,
      runGeneration,
      reload: load,
    }),
    [
      state,
      dispatch,
      createSession,
      saveWorkflowArtifacts,
      saveClarificationQuestions,
      savePrdSections,
      saveStories,
      saveSettings,
      refreshAiCapability,
      runGeneration,
      load,
    ],
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
