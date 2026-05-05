import type {
  ClarificationQuestion,
  Epic,
  ExportPackage,
  PRDSection,
  ProjectSession,
  Story,
  WorkspaceSettings,
} from './types';

const fallbackQuestions: ClarificationQuestion[] = [
  {
    id: 'fallback-question-1',
    group: 'Scope',
    text: 'What outcome matters most for this workflow?',
    required: true,
    answer: '',
    skipped: false,
  },
];

const fallbackPrdSections: PRDSection[] = [
  {
    id: 'fallback-prd-1',
    title: 'Problem Statement',
    content: '',
    complete: false,
    order: 1,
  },
];

const fallbackEpics: Epic[] = [];
const fallbackStories: Story[] = [];

function createFallbackSession(
  id: string,
  projectId: string,
  name: string,
  jiraKey: string,
): ProjectSession {
  return {
    id,
    projectId,
    name,
    inputType: 'Mixed notes',
    outputDepth: 'Standard',
    jiraKey,
    targetUsers: ['Product Manager'],
    businessGoal: 'Fallback demo session.',
    knownConstraints: '',
    labels: ['Fallback'],
    rawInput: 'Fallback session data for offline demo usage.',
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    clarificationQuestions: fallbackQuestions.map((question) => ({ ...question })),
    prdSections: fallbackPrdSections.map((section) => ({ ...section })),
    epics: fallbackEpics,
    stories: fallbackStories,
  };
}

export const mockSession = createFallbackSession(
  'fallback-session-1',
  'fallback-project-1',
  'Fallback Session One',
  'FALL',
);
export const mockSession2 = createFallbackSession(
  'fallback-session-2',
  'fallback-project-2',
  'Fallback Session Two',
  'BACK',
);
export const mockSession3 = createFallbackSession(
  'fallback-session-3',
  'fallback-project-3',
  'Fallback Session Three',
  'DEMO',
);
export const mockSession4 = createFallbackSession(
  'fallback-session-4',
  'fallback-project-4',
  'Fallback Session Four',
  'SPEC',
);

export const allSessions: ProjectSession[] = [
  mockSession,
  mockSession2,
  mockSession3,
  mockSession4,
];

export const mockClarificationQuestions: ClarificationQuestion[] =
  fallbackQuestions.map((question) => ({ ...question }));
export const mockPRDSections: PRDSection[] = fallbackPrdSections.map((section) => ({
  ...section,
}));
export const mockEpics: Epic[] = fallbackEpics;
export const mockStories: Story[] = fallbackStories;
export const mockExportPackages: ExportPackage[] = [
  {
    id: 'fallback-export-1',
    sessionId: mockSession.id,
    sessionName: mockSession.name,
    date: new Date().toISOString(),
    epicCount: 0,
    storyCount: 0,
    avgReadiness: 0,
    format: 'json',
    status: 'draft',
  },
];

export const mockSettings: WorkspaceSettings = {
  id: 'fallback-settings',
  workspaceName: 'SpecFlow Demo Workspace',
  jiraKey: 'DEMO',
  defaultLabels: ['Feature', 'Demo'],
  defaultComponents: ['Dashboard', 'Workspace'],
  templatePreference: 'Standard',
  qualityThreshold: 75,
  devReviewRequired: true,
  autoGenerateQuestions: true,
  showReadinessWarnings: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
