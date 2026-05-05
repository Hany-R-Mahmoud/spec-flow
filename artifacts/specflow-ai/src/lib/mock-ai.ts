import type {
  ClarificationQuestion,
  Epic,
  PRDSection,
  ProjectSession,
  QualityWarning,
  ReadinessScore,
  Story,
} from './types';

function compactText(input: string): string[] {
  return input
    .split(/[\n.!?]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function firstMeaningfulLine(session: ProjectSession): string {
  return (
    compactText(session.businessGoal)[0] ??
    compactText(session.rawInput)[0] ??
    'Ship the first useful workflow slice.'
  );
}

export function generateClarificationQuestions(
  session: ProjectSession,
): ClarificationQuestion[] {
  const primaryUser = session.targetUsers[0] ?? 'the primary user';
  const goal = firstMeaningfulLine(session);

  return [
    {
      id: `${session.id}-clarification-scope`,
      group: 'Scope',
      text: `What is the smallest outcome that proves value for ${primaryUser}?`,
      required: true,
      answer: '',
      skipped: false,
    },
    {
      id: `${session.id}-clarification-success`,
      group: 'Success Metrics',
      text: `What metric or signal confirms "${goal}" worked?`,
      required: true,
      answer: '',
      skipped: false,
    },
    {
      id: `${session.id}-clarification-constraints`,
      group: 'Constraints',
      text: 'Which dependency, approval, or technical constraint is non-negotiable?',
      required: true,
      answer: '',
      skipped: false,
    },
    {
      id: `${session.id}-clarification-edge`,
      group: 'Edge Cases',
      text: 'Which risky scenario should be handled before this is considered ready?',
      required: false,
      answer: '',
      skipped: false,
    },
  ];
}

export function generatePRD(session: ProjectSession): PRDSection[] {
  const answered = session.clarificationQuestions
    .filter((question) => question.answer.trim() && !question.skipped)
    .map((question) => `${question.group}: ${question.answer.trim()}`);

  return [
    {
      id: 'prd-problem',
      title: 'Problem Statement',
      content: `Current challenge: ${firstMeaningfulLine(session)}\nThe current workflow still contains ambiguity that slows PM and engineering handoff.`,
      complete: true,
      order: 1,
    },
    {
      id: 'prd-users',
      title: 'Target Users',
      content: `Primary users: ${session.targetUsers.join(', ') || 'Product team'}\n${answered.find((item) => item.startsWith('Scope:')) ?? ''}`.trim(),
      complete: true,
      order: 2,
    },
    {
      id: 'prd-scope',
      title: 'Scope',
      content: [
        '- Deliver the smallest high-confidence slice first.',
        '- Preserve recoverable workflow state between steps.',
        '- Keep manual review possible where automation stays uncertain.',
      ].join('\n'),
      complete: true,
      order: 3,
    },
    {
      id: 'prd-risks',
      title: 'Risks and Unknowns',
      content: [
        `- ${session.knownConstraints || 'Unclear constraints may reduce output quality.'}`,
        answered.find((item) => item.startsWith('Edge Cases:')) ? `- ${answered.find((item) => item.startsWith('Edge Cases:'))}` : '- Edge cases still need explicit review before export.',
      ].join('\n'),
      complete: true,
      order: 4,
    },
  ];
}

export function generateEpics(session: ProjectSession, prd: PRDSection[]): Epic[] {
  const scope = prd.find((section) => section.id === 'prd-scope')?.content ?? '';
  const risks = prd.find((section) => section.id === 'prd-risks')?.content ?? '';

  return [
    {
      id: `${session.id}-epic-foundation`,
      sessionId: session.id,
      title: 'Workflow foundation',
      businessObjective: 'Turn raw intake into saved structured planning context.',
      scopeSummary: scope || 'Create the first stable path from intake to review.',
      prdRequirements: ['REQ-1', 'REQ-2'],
      priority: 'P1',
      dependencies: [],
      risks: [risks.split('\n')[0]?.replace(/^- /, '') || 'Initial scope may be too broad.'],
      jiraEpicDescription:
        'Build the first durable workflow slice so PMs can move from intake into structured planning without losing context.',
      storyCount: 2,
    },
    {
      id: `${session.id}-epic-quality`,
      sessionId: session.id,
      title: 'Quality and review signals',
      businessObjective: 'Expose readiness and risk before export or engineering handoff.',
      scopeSummary: 'Score generated output, explain warnings, and protect prior saved artifacts on failures.',
      prdRequirements: ['REQ-3', 'REQ-4'],
      priority: 'P1',
      dependencies: [`${session.id}-epic-foundation`],
      risks: ['Low-detail input can create stories that look complete but are still risky.'],
      jiraEpicDescription:
        'Add quality scoring and review loops so generated planning output is honest about uncertainty.',
      storyCount: 2,
    },
  ];
}

function scoreLabel(total: number): ReadinessScore['label'] {
  if (total >= 90) return 'Ready for Jira';
  if (total >= 75) return 'Minor review needed';
  if (total >= 60) return 'Needs PM refinement';
  return 'Not ready';
}

export function scoreStory(story: Story): ReadinessScore {
  const clarity = Math.min(20, 10 + Math.min(10, Math.floor(story.description.length / 18)));
  const acceptanceCriteria = Math.min(
    20,
    8 + story.acceptanceCriteria.filter((item) => item.trim().length > 12).length * 4,
  );
  const businessAlignment = story.userStory.includes('As a') ? 13 : 9;
  const technicalFeasibility = story.technicalNotes ? 12 : 8;
  const testability = story.qaNotes ? 8 : 5;
  const edgeCasesErrorHandling = story.edgeCases.length > 0 && story.errorHandling ? 8 : 5;
  const dependenciesDesignLocalization =
    (story.dependencies.length > 0 ? 4 : 2) +
    (story.designNotes ? 2 : 1) +
    (story.localizationNotes ? 2 : 1) +
    (story.components.length > 0 ? 2 : 1);
  const total =
    clarity +
    acceptanceCriteria +
    businessAlignment +
    technicalFeasibility +
    testability +
    edgeCasesErrorHandling +
    dependenciesDesignLocalization;

  return {
    total,
    clarity,
    acceptanceCriteria,
    businessAlignment,
    technicalFeasibility,
    testability,
    edgeCasesErrorHandling,
    dependenciesDesignLocalization,
    label: scoreLabel(total),
  };
}

export function detectWarnings(story: Story): QualityWarning[] {
  const warnings: QualityWarning[] = [];

  if (story.acceptanceCriteria.length < 2) {
    warnings.push({
      id: `${story.id}-warning-ac`,
      type: 'acceptance-criteria',
      message: 'Acceptance criteria may be too thin for reliable engineering handoff.',
      severity: 'warning',
    });
  }

  if (!story.technicalNotes.trim()) {
    warnings.push({
      id: `${story.id}-warning-tech`,
      type: 'technical-notes',
      message: 'Technical notes are missing; implementation assumptions may drift.',
      severity: 'warning',
    });
  }

  if (story.openQuestions.length > 0) {
    warnings.push({
      id: `${story.id}-warning-open`,
      type: 'open-questions',
      message: `Open questions remain: ${story.openQuestions.join('; ')}`,
      severity: 'info',
    });
  }

  return warnings;
}

export function generateStories(epics: Epic[], session: ProjectSession): Story[] {
  return epics.flatMap((epic, index) => {
    const stories: Story[] = [
      {
        id: `${session.id}-story-${index * 2 + 1}`,
        epicId: epic.id,
        sessionId: session.id,
        title: index === 0 ? 'Persist workflow state through planning phases' : 'Surface readiness scoring with warning context',
        userStory:
          index === 0
            ? 'As a PM, I want workflow context preserved so planning does not restart after refresh.'
            : 'As a reviewer, I want readiness signals so I can separate safe stories from risky ones quickly.',
        description:
          index === 0
            ? 'Store intake, clarification, and generated planning artifacts so the workspace resumes accurately.'
            : 'Compute readiness and warnings for every generated story before export or developer review.',
        acceptanceCriteria:
          index === 0
            ? [
                'Session data survives refresh.',
                'The current phase reopens after reload.',
                'Clarification answers are still present after resume.',
              ]
            : [
                'Each story includes a readiness score.',
                'Warnings explain missing detail or risk.',
                'Quality review can be rerun after edits.',
              ],
        priority: 'P1',
        labels: session.labels.length > 0 ? session.labels : ['AI Workflow'],
        components: index === 0 ? ['Workspace', 'Projects'] : ['Stories', 'Quality Review'],
        dependencies: index === 0 ? [] : [`${session.id}-story-1`],
        edgeCases:
          index === 0
            ? ['Optional fields may be blank but should still persist safely.']
            : ['Low-detail stories should warn instead of appearing ready.'],
        errorHandling:
          index === 0
            ? 'If persistence fails, keep the latest local edits visible until retry.'
            : 'If scoring fails, preserve the last saved story state and show a retry path.',
        localizationNotes: '',
        designNotes: index === 0 ? 'Saved state cues should stay quiet but visible.' : 'Warnings should be easy to scan before deep review.',
        analyticsNotes: index === 0 ? 'Track session create and resume.' : 'Track quality reruns and warning counts.',
        qaNotes: index === 0 ? 'Refresh after editing and confirm state is intact.' : 'Verify warning totals change after story edits.',
        technicalNotes:
          index === 0
            ? 'Reuse shared API contracts for saved artifacts.'
            : 'Score with a deterministic rubric before any live model integration.',
        openQuestions: index === 0 ? [] : session.knownConstraints ? [] : ['Should readiness threshold be configurable per workspace?'],
        readinessScore: {
          total: 0,
          clarity: 0,
          acceptanceCriteria: 0,
          businessAlignment: 0,
          technicalFeasibility: 0,
          testability: 0,
          edgeCasesErrorHandling: 0,
          dependenciesDesignLocalization: 0,
          label: 'Not ready',
        },
        warnings: [],
        reviewStatus: 'pending',
      },
      {
        id: `${session.id}-story-${index * 2 + 2}`,
        epicId: epic.id,
        sessionId: session.id,
        title: index === 0 ? 'Generate structured PRD and epics from clarified intake' : 'Protect prior output when generation fails',
        userStory:
          index === 0
            ? 'As a PM, I want clarified input transformed into structured planning artifacts so the team can move faster.'
            : 'As a PM, I want failed generation runs to keep prior output intact so retry is safe.',
        description:
          index === 0
            ? 'Transform the latest intake and clarification answers into non-empty PRD sections and epics.'
            : 'Track generation status separately from artifacts so failed attempts do not overwrite trusted work.',
        acceptanceCriteria:
          index === 0
            ? [
                'Generated PRD sections are non-empty.',
                'Epics include business objective, risk, and requirement references.',
              ]
            : [
                'Failed generation marks the step as failed or unavailable.',
                'Previously saved artifacts remain visible after failure.',
                'The user can retry explicitly.',
              ],
        priority: 'P1',
        labels: session.labels.length > 0 ? session.labels : ['AI Workflow'],
        components: index === 0 ? ['PRD', 'Epics'] : ['API Server', 'Workflow Workspace'],
        dependencies: index === 0 ? [`${session.id}-story-1`] : [`${session.id}-story-3`],
        edgeCases: index === 0 ? ['Skipped optional answers should not block generation.'] : ['Unavailable mode should explain why generation cannot proceed.'],
        errorHandling:
          index === 0
            ? 'If generation returns invalid output, preserve the last saved draft.'
            : 'Write failure state to generation metadata and allow explicit retry.',
        localizationNotes: '',
        designNotes: '',
        analyticsNotes: '',
        qaNotes:
          index === 0
            ? 'Regenerate after changing clarification answers and confirm sections change.'
            : 'Simulate unavailable mode and confirm prior artifacts remain untouched.',
        technicalNotes:
          index === 0
            ? 'Validate generated PRD sections and epics before saving.'
            : 'Keep prompt versions in metadata for inspectable workflow runs.',
        openQuestions: [],
        readinessScore: {
          total: 0,
          clarity: 0,
          acceptanceCriteria: 0,
          businessAlignment: 0,
          technicalFeasibility: 0,
          testability: 0,
          edgeCasesErrorHandling: 0,
          dependenciesDesignLocalization: 0,
          label: 'Not ready',
        },
        warnings: [],
        reviewStatus: 'pending',
      },
    ];

    return stories.map((story) => {
      const readinessScore = scoreStory(story);
      return {
        ...story,
        readinessScore,
        warnings: detectWarnings({ ...story, readinessScore }),
      };
    });
  });
}

export function suggestSplit(story: Story): Story[] {
  if (story.acceptanceCriteria.length < 4) {
    return [];
  }

  return [
    {
      ...story,
      id: `${story.id}-part-1`,
      title: `${story.title} (Part 1)`,
      acceptanceCriteria: story.acceptanceCriteria.slice(0, 2),
      readinessScore: { ...story.readinessScore, total: Math.max(70, story.readinessScore.total - 5) },
    },
    {
      ...story,
      id: `${story.id}-part-2`,
      title: `${story.title} (Part 2)`,
      acceptanceCriteria: story.acceptanceCriteria.slice(2),
      readinessScore: { ...story.readinessScore, total: Math.max(70, story.readinessScore.total - 5) },
    },
  ];
}

export function applyQualityReview(stories: Story[]): Story[] {
  return stories.map((story) => {
    const readinessScore = scoreStory(story);
    return {
      ...story,
      readinessScore,
      warnings: detectWarnings({ ...story, readinessScore }),
    };
  });
}

export function formatForExport(stories: Story[], format: 'markdown' | 'csv' | 'json'): string {
  if (format === 'json') return JSON.stringify(stories, null, 2);
  if (format === 'csv') return 'ID,Title\n' + stories.map((story) => `${story.id},${story.title}`).join('\n');
  return stories.map((story) => `# ${story.title}\n${story.description}`).join('\n\n');
}
