export type PhaseStatus = 'not-started' | 'in-progress' | 'complete' | 'needs-attention'

export interface ProjectSession {
  id: string
  name: string
  inputType: string
  outputDepth: string
  jiraKey: string
  targetUsers: string[]
  businessGoal: string
  knownConstraints: string
  labels: string[]
  rawInput: string
  currentPhase: Phase
  phases: Record<Phase, PhaseStatus>
  createdAt: string
  updatedAt: string
}

export type Phase = 'intake' | 'clarification' | 'prd' | 'epics' | 'stories' | 'quality' | 'devReview' | 'export'

export interface ClarificationQuestion {
  id: string
  group: string
  text: string
  required: boolean
  answer: string
  skipped: boolean
}

export interface PRDSection {
  id: string
  title: string
  content: string
  complete: boolean
  order: number
}

export interface Epic {
  id: string
  sessionId: string
  title: string
  businessObjective: string
  scopeSummary: string
  prdRequirements: string[]
  priority: 'P0' | 'P1' | 'P2'
  dependencies: string[]
  risks: string[]
  jiraEpicDescription: string
  storyCount: number
}

export interface Story {
  id: string
  epicId: string
  sessionId: string
  title: string
  userStory: string
  description: string
  acceptanceCriteria: string[]
  priority: 'P0' | 'P1' | 'P2' | 'P3'
  labels: string[]
  components: string[]
  dependencies: string[]
  edgeCases: string[]
  errorHandling: string
  localizationNotes: string
  designNotes: string
  analyticsNotes: string
  qaNotes: string
  technicalNotes: string
  openQuestions: string[]
  readinessScore: ReadinessScore
  warnings: QualityWarning[]
  reviewStatus: ReviewStatus
  developerReview?: DeveloperReview
}

export interface ReadinessScore {
  total: number
  clarity: number
  acceptanceCriteria: number
  businessAlignment: number
  technicalFeasibility: number
  testability: number
  edgeCasesErrorHandling: number
  dependenciesDesignLocalization: number
  label: 'Ready for Jira' | 'Minor review needed' | 'Needs PM refinement' | 'Not ready'
}

export interface QualityWarning {
  id: string
  type: string
  message: string
  severity: 'error' | 'warning' | 'info'
}

export type ReviewStatus = 'pending' | 'approved' | 'needs-clarification' | 'too-large' | 'technically-risky' | 'blocked' | 'missing-ac'

export interface DeveloperReview {
  status: ReviewStatus
  comment: string
  reviewerName: string
  timestamp: string
  pmRevisionStatus: 'not-started' | 'in-progress' | 'resolved'
}

export interface ExportPackage {
  id: string
  sessionId: string
  sessionName: string
  date: string
  epicCount: number
  storyCount: number
  avgReadiness: number
  format: 'markdown' | 'csv' | 'json'
  status: 'complete' | 'partial' | 'draft'
}
