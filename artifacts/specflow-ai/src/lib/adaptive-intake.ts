import type {
  ClarificationQuestion,
  Epic,
  Phase,
  PhaseStatus,
  PRDSection,
  Story,
} from '@/lib/types';

type PhaseReadiness = 'complete' | 'partial' | 'missing' | 'unknown';
type PhaseAction = 'reuse' | 'continue' | 'generate' | 'review';

export type AdaptivePhasePlan = {
  phase: Phase;
  label: string;
  readiness: PhaseReadiness;
  action: PhaseAction;
  evidence: string;
};

export type AdaptiveIntakeAnalysis = {
  hasDetectedContent: boolean;
  recommendedPhase: Phase;
  summary: string;
  phasePlan: AdaptivePhasePlan[];
  detected: {
    prdSections: number;
    stories: number;
    clarificationAnswers: number;
    unknownNotes: number;
  };
};

export type AdaptiveArtifactsPatch = {
  clarificationQuestions?: ClarificationQuestion[];
  prdSections?: PRDSection[];
  epics?: Epic[];
  stories?: Story[];
};

type AdaptiveIntakeInput = {
  rawInput: string;
  inputType: string;
  businessGoal?: string;
  knownConstraints?: string;
  targetUsers: string[];
  labels: string[];
};

type SectionSeed = {
  id: string;
  title: string;
  matchers: RegExp[];
};

const CANONICAL_PHASES: Array<{ phase: Phase; label: string }> = [
  { phase: 'clarification', label: 'Clarification' },
  { phase: 'prd', label: 'PRD' },
  { phase: 'epics', label: 'Epics' },
  { phase: 'stories', label: 'Stories' },
  { phase: 'quality', label: 'Quality' },
  { phase: 'export', label: 'Export' },
];

const PRD_SECTION_SEEDS: SectionSeed[] = [
  {
    id: 'prd-problem',
    title: 'Problem Statement',
    matchers: [/problem/i, /overview/i, /background/i, /goal/i],
  },
  {
    id: 'prd-users',
    title: 'Target Users',
    matchers: [/user/i, /persona/i, /audience/i, /customer/i],
  },
  {
    id: 'prd-scope',
    title: 'Scope',
    matchers: [/scope/i, /requirement/i, /feature/i, /must/i, /should/i],
  },
  {
    id: 'prd-risks',
    title: 'Risks and Unknowns',
    matchers: [/risk/i, /unknown/i, /constraint/i, /dependency/i, /edge/i],
  },
];

const DEFAULT_READINESS = {
  total: 65,
  clarity: 65,
  acceptanceCriteria: 55,
  businessAlignment: 65,
  technicalFeasibility: 55,
  testability: 55,
  edgeCasesErrorHandling: 45,
  dependenciesDesignLocalization: 45,
  label: 'Needs PM refinement' as const,
};

function splitLines(rawInput: string): string[] {
  return rawInput
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function hasPrdSignals(input: AdaptiveIntakeInput): boolean {
  const raw = input.rawInput.toLowerCase();
  return (
    input.inputType === 'PRD draft' ||
    /(^|\n)#{1,3}\s*(problem|overview|scope|requirements|success|users|risks)/i.test(input.rawInput) ||
    raw.includes('acceptance criteria') ||
    raw.includes('success metrics') ||
    raw.includes('requirements')
  );
}

function extractSectionContent(rawInput: string, seed: SectionSeed): string {
  const lines = splitLines(rawInput);
  const matched = lines.filter((line) =>
    seed.matchers.some((matcher) => matcher.test(line)),
  );

  return matched.slice(0, 6).join('\n');
}

function extractStoryLines(rawInput: string): string[] {
  return splitLines(rawInput)
    .filter((line) => /\bas a\b.+\bi want\b/i.test(line) || /^story\s*:/i.test(line))
    .slice(0, 5);
}

function extractAcceptanceCriteria(rawInput: string): string[] {
  const lines = splitLines(rawInput);
  const criteria = lines.filter((line) =>
    /^[-*]\s+/.test(line) &&
    /\b(should|must|can|able to|when|then|given|verify|support)\b/i.test(line),
  );

  return criteria
    .map((line) => line.replace(/^[-*]\s+/, ''))
    .slice(0, 6);
}

function makePhasePlan(input: AdaptiveIntakeInput): AdaptivePhasePlan[] {
  const storyCount = extractStoryLines(input.rawInput).length;
  const prdLikely = hasPrdSignals(input);
  const hasClarification =
    Boolean(input.businessGoal?.trim()) ||
    Boolean(input.knownConstraints?.trim()) ||
    input.targetUsers.length > 0;
  const rawLength = input.rawInput.trim().length;

  return CANONICAL_PHASES.map(({ phase, label }) => {
    if (phase === 'clarification') {
      return hasClarification || rawLength > 500
        ? {
            phase,
            label,
            readiness: 'complete',
            action: 'reuse',
            evidence: 'Context already includes goal, users, constraints, or detailed notes.',
          }
        : {
            phase,
            label,
            readiness: 'partial',
            action: 'continue',
            evidence: 'Some context exists, but key decisions may still need answers.',
          };
    }

    if (phase === 'prd') {
      return prdLikely
        ? {
            phase,
            label,
            readiness: 'partial',
            action: 'reuse',
            evidence: 'Input looks like a PRD draft or contains requirement sections.',
          }
        : {
            phase,
            label,
            readiness: 'missing',
            action: 'generate',
            evidence: 'No clear PRD structure detected.',
          };
    }

    if (phase === 'epics') {
      return /(^|\n)#{1,3}\s*epic|epic\s*:/i.test(input.rawInput) || storyCount > 0
        ? {
            phase,
            label,
            readiness: storyCount > 0 ? 'complete' : 'partial',
            action: 'reuse',
            evidence:
              storyCount > 0
                ? 'Imported stories will be grouped under an imported scope epic.'
                : 'Epic-like headings or labels detected.',
          }
        : {
            phase,
            label,
            readiness: 'missing',
            action: 'generate',
            evidence: 'No explicit epics detected.',
          };
    }

    if (phase === 'stories') {
      return storyCount > 0
        ? {
            phase,
            label,
            readiness: storyCount > 2 ? 'complete' : 'partial',
            action: 'reuse',
            evidence: `${storyCount} user ${storyCount === 1 ? 'story' : 'stories'} detected.`,
          }
        : {
            phase,
            label,
            readiness: 'missing',
            action: 'generate',
            evidence: 'No user-story lines detected.',
          };
    }

    if (phase === 'quality') {
      return storyCount > 0
        ? {
            phase,
            label,
            readiness: 'missing',
            action: 'generate',
            evidence: 'Imported stories should be reviewed before export.',
          }
        : {
            phase,
            label,
            readiness: 'missing',
            action: 'generate',
            evidence: 'Quality review needs stories first.',
          };
    }

    return {
      phase,
      label,
      readiness: 'missing',
      action: 'generate',
      evidence: 'Export requires reviewed stories.',
    };
  });
}

function getRecommendedPhase(plan: AdaptivePhasePlan[]): Phase {
  const stories = plan.find((item) => item.phase === 'stories');
  const prd = plan.find((item) => item.phase === 'prd');

  if (stories?.action === 'reuse') {
    return 'quality';
  }

  if (prd?.action === 'reuse') {
    return 'epics';
  }

  return 'clarification';
}

export function analyzeAdaptiveIntake(
  input: AdaptiveIntakeInput,
): AdaptiveIntakeAnalysis {
  const phasePlan = makePhasePlan(input);
  const recommendedPhase = getRecommendedPhase(phasePlan);
  const storyCount = extractStoryLines(input.rawInput).length;
  const prdSectionCount = hasPrdSignals(input)
    ? PRD_SECTION_SEEDS.filter(
        (seed) => extractSectionContent(input.rawInput, seed).length > 0,
      ).length || 1
    : 0;
  const clarificationAnswers = [
    input.businessGoal,
    input.knownConstraints,
    ...input.targetUsers,
  ].filter((value) => Boolean(value?.trim())).length;
  const unknownNotes =
    input.rawInput.toLowerCase().includes('maybe') ||
    input.rawInput.toLowerCase().includes('not sure') ||
    input.rawInput.toLowerCase().includes('unknown')
      ? 1
      : 0;

  return {
    hasDetectedContent: input.rawInput.trim().length >= 80,
    recommendedPhase,
    summary:
      recommendedPhase === 'quality'
        ? 'Existing stories detected. Start at quality review.'
        : recommendedPhase === 'epics'
          ? 'PRD-like content detected. Start at epics.'
          : 'Start with clarification to fill missing decisions.',
    phasePlan,
    detected: {
      prdSections: prdSectionCount,
      stories: storyCount,
      clarificationAnswers,
      unknownNotes,
    },
  };
}

export function buildAdaptiveArtifacts(
  input: AdaptiveIntakeInput,
  sessionId: string,
): AdaptiveArtifactsPatch {
  const storyLines = extractStoryLines(input.rawInput);
  const acceptanceCriteria = extractAcceptanceCriteria(input.rawInput);
  const prdSections: PRDSection[] = PRD_SECTION_SEEDS.map((seed, index) => {
    const content = extractSectionContent(input.rawInput, seed);
    return {
      id: seed.id,
      title: seed.title,
      content:
        content ||
        (index === 0 && hasPrdSignals(input)
          ? input.rawInput.slice(0, 1200)
          : ''),
      complete: content.length > 40 || (index === 0 && hasPrdSignals(input)),
      order: index + 1,
    };
  });

  const importedEpic: Epic = {
    id: `${sessionId}-imported-epic-1`,
    sessionId,
    title: 'Imported Scope',
    businessObjective:
      input.businessGoal?.trim() || 'Preserve and structure imported product content.',
    scopeSummary: input.rawInput.slice(0, 500),
    prdRequirements: prdSections
      .filter((section) => section.complete)
      .map((section) => section.title),
    priority: 'P1',
    dependencies: input.knownConstraints ? [input.knownConstraints] : [],
    risks: ['Unknown / verify imported assumptions before export.'],
    jiraEpicDescription: input.rawInput.slice(0, 1200),
    storyCount: Math.max(storyLines.length, 0),
  };

  const stories: Story[] = storyLines.map((line, index) => ({
    id: `${sessionId}-imported-story-${index + 1}`,
    epicId: importedEpic.id,
    sessionId,
    title: line.replace(/^story\s*:\s*/i, '').slice(0, 90),
    userStory: line.replace(/^story\s*:\s*/i, ''),
    description: 'Imported from existing content. Review before export.',
    acceptanceCriteria:
      acceptanceCriteria.length > 0
        ? acceptanceCriteria
        : ['Unknown / verify acceptance criteria for this imported story.'],
    priority: 'P2',
    labels: input.labels,
    components: input.labels,
    dependencies: input.knownConstraints ? [input.knownConstraints] : [],
    edgeCases: ['Unknown / verify edge cases from imported content.'],
    errorHandling: 'Unknown / verify error handling.',
    localizationNotes: 'Unknown / verify localization requirements.',
    designNotes: 'Unknown / verify design requirements.',
    analyticsNotes: 'Unknown / verify analytics requirements.',
    qaNotes: 'Imported story requires QA review before export.',
    technicalNotes: input.knownConstraints || 'Unknown / verify technical constraints.',
    openQuestions: ['Which imported assumptions should be confirmed before delivery?'],
    readinessScore: DEFAULT_READINESS,
    warnings: [
      {
        id: `${sessionId}-imported-story-${index + 1}-warning-1`,
        type: 'import-review',
        message: 'Imported story should pass quality review before export.',
        severity: 'warning',
      },
    ],
    reviewStatus: 'pending',
    developerReview: null,
  }));

  const clarificationQuestions: ClarificationQuestion[] = [
    {
      id: 'clarity-scope',
      group: 'Scope',
      text: 'What user problem should this workflow solve first?',
      required: true,
      answer: input.businessGoal || '',
      skipped: false,
    },
    {
      id: 'clarity-success',
      group: 'Success Metrics',
      text: 'How will the team know this breakdown produced a successful outcome?',
      required: true,
      answer: '',
      skipped: false,
    },
    {
      id: 'clarity-risk',
      group: 'Constraints',
      text: 'Which non-negotiable constraints or dependencies already exist?',
      required: true,
      answer: input.knownConstraints || '',
      skipped: false,
    },
    {
      id: 'clarity-edge',
      group: 'Edge Cases',
      text: 'Which risky scenario should be handled before delivery?',
      required: false,
      answer: '',
      skipped: false,
    },
  ];

  return {
    clarificationQuestions,
    prdSections,
    epics: stories.length > 0 ? [importedEpic] : [],
    stories,
  };
}

export function buildAdaptivePhasePatch(
  analysis: AdaptiveIntakeAnalysis,
): { currentPhase: Phase; phases: Record<Phase, PhaseStatus> } {
  const phases: Record<Phase, PhaseStatus> = {
    intake: 'complete',
    clarification: 'not-started',
    prd: 'not-started',
    epics: 'not-started',
    stories: 'not-started',
    quality: 'not-started',
    devReview: 'not-started',
    export: 'not-started',
  };

  for (const item of analysis.phasePlan) {
    phases[item.phase] =
      item.phase === analysis.recommendedPhase
        ? 'in-progress'
        : item.action === 'reuse'
          ? 'complete'
          : item.readiness === 'partial'
            ? 'needs-attention'
            : 'not-started';
  }

  phases[analysis.recommendedPhase] = 'in-progress';

  return {
    currentPhase: analysis.recommendedPhase,
    phases,
  };
}
