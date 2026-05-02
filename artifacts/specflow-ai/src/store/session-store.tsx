import { createContext, useContext, useReducer, ReactNode } from 'react';
import { ProjectSession, Phase, Story, Epic, ClarificationQuestion, PRDSection } from '../lib/types';
import { mockSession, mockSession2, mockSession3, mockSession4, mockEpics, mockStories, mockClarificationQuestions, mockPRDSections } from '../lib/sample-data';

interface State {
  sessions: ProjectSession[];
  activeSessionId: string | null;
  epics: Epic[];
  stories: Story[];
  clarificationQuestions: ClarificationQuestion[];
  prdSections: PRDSection[];
}

type Action =
  | { type: 'SET_ACTIVE_SESSION'; payload: string }
  | { type: 'ADD_SESSION'; payload: ProjectSession }
  | { type: 'UPDATE_SESSION'; payload: Partial<ProjectSession> & { id: string } }
  | { type: 'SET_PHASE'; payload: { sessionId: string; phase: Phase } }
  | { type: 'UPDATE_STORY'; payload: Story }
  | { type: 'UPDATE_CLARIFICATION'; payload: { id: string; answer: string; skipped?: boolean } }
  | { type: 'UPDATE_PRD_SECTION'; payload: { id: string; content: string; complete: boolean } };

const initialState: State = {
  sessions: [mockSession, mockSession2, mockSession3, mockSession4],
  activeSessionId: mockSession.id,
  epics: mockEpics,
  stories: mockStories,
  clarificationQuestions: mockClarificationQuestions,
  prdSections: mockPRDSections,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_ACTIVE_SESSION':
      return { ...state, activeSessionId: action.payload };
    case 'ADD_SESSION':
      return { ...state, sessions: [...state.sessions, action.payload], activeSessionId: action.payload.id };
    case 'UPDATE_SESSION':
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id === action.payload.id ? { ...s, ...action.payload } : s
        ),
      };
    case 'SET_PHASE': {
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id === action.payload.sessionId
            ? { ...s, currentPhase: action.payload.phase }
            : s
        ),
      };
    }
    case 'UPDATE_STORY':
      return {
        ...state,
        stories: state.stories.map((s) => s.id === action.payload.id ? action.payload : s),
      };
    case 'UPDATE_CLARIFICATION':
      return {
        ...state,
        clarificationQuestions: state.clarificationQuestions.map((q) =>
          q.id === action.payload.id
            ? { ...q, answer: action.payload.answer, skipped: action.payload.skipped ?? q.skipped }
            : q
        ),
      };
    case 'UPDATE_PRD_SECTION':
      return {
        ...state,
        prdSections: state.prdSections.map((s) =>
          s.id === action.payload.id
            ? { ...s, content: action.payload.content, complete: action.payload.complete }
            : s
        ),
      };
    default:
      return state;
  }
}

const SessionContext = createContext<{ state: State; dispatch: React.Dispatch<Action> } | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <SessionContext.Provider value={{ state, dispatch }}>{children}</SessionContext.Provider>;
}

export function useSessionStore() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSessionStore must be used within a SessionProvider');
  }
  return context;
}
