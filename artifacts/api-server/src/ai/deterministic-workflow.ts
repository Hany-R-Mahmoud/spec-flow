import type {
  ClarificationQuestion,
  Epic,
  QualityWarning,
  ReadinessScore,
  PRDSection,
  Story,
} from "@workspace/db";

type WorkflowDraft = {
  id: string;
  name: string;
  inputType: string;
  outputDepth: string;
  jiraKey: string;
  targetUsers: string[];
  businessGoal: string;
  knownConstraints: string;
  labels: string[];
  rawInput: string;
  clarificationQuestions: ClarificationQuestion[];
  prdSections: PRDSection[];
  epics: Epic[];
  stories: Story[];
};

function compactSentences(input: string): string[] {
  return input
    .split(/[\n.!?]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function pickPrimarySentence(session: WorkflowDraft): string {
  return (
    compactSentences(session.businessGoal)[0] ??
    compactSentences(session.rawInput)[0] ??
    "Clarify the first valuable slice for delivery."
  );
}

function pickConstraint(session: WorkflowDraft): string {
  return (
    compactSentences(session.knownConstraints)[0] ??
    "Existing integrations and process constraints must be respected."
  );
}

function prdRequirementId(index: number): string {
  return `REQ-${index + 1}`;
}

export function generateClarificationQuestions(session: WorkflowDraft): ClarificationQuestion[] {
  const goal = pickPrimarySentence(session);
  const constraint = pickConstraint(session);
  const primaryUser = session.targetUsers[0] ?? "the primary workflow owner";

  return [
    {
      id: "clarification-scope-primary",
      group: "Scope",
      text: `What is the smallest successful outcome for ${primaryUser} in this release?`,
      required: true,
      answer: "",
      skipped: false,
    },
    {
      id: "clarification-success-primary",
      group: "Success Metrics",
      text: `Which signal proves "${goal}" actually delivered value?`,
      required: true,
      answer: "",
      skipped: false,
    },
    {
      id: "clarification-constraints-primary",
      group: "Constraints",
      text: `Which hard constraint matters most while solving this: ${constraint}`,
      required: true,
      answer: "",
      skipped: false,
    },
    {
      id: "clarification-dependencies-primary",
      group: "Dependencies",
      text: "Which team, system, or approval could block the first rollout?",
      required: true,
      answer: "",
      skipped: false,
    },
    {
      id: "clarification-edge-primary",
      group: "Edge Cases",
      text: "Which risky or ambiguous case should be handled before calling this ready?",
      required: false,
      answer: "",
      skipped: false,
    },
  ];
}

function answeredQuestionSummary(session: WorkflowDraft): string[] {
  const answered = session.clarificationQuestions
    .filter((question) => question.answer.trim() && !question.skipped)
    .map((question) => `${question.group}: ${question.answer.trim()}`);

  if (answered.length > 0) {
    return answered;
  }

  return [
    `Business Goal: ${session.businessGoal || pickPrimarySentence(session)}`,
    `Constraints: ${session.knownConstraints || pickConstraint(session)}`,
  ];
}

export function generatePrdSections(session: WorkflowDraft): PRDSection[] {
  const answered = answeredQuestionSummary(session);
  const scopeBullets = [
    `Deliver the first workable slice for ${session.targetUsers[0] ?? "the team"}.`,
    `Keep the initial release focused on ${pickPrimarySentence(session).toLowerCase()}.`,
    `Preserve clear recovery paths when constraints block automation.`,
  ];

  return [
    {
      id: "prd-problem",
      title: "Problem Statement",
      content: [
        `Current input: ${pickPrimarySentence(session)}`,
        `The current process leaves PMs and reviewers with avoidable ambiguity and rework.`,
      ].join("\n"),
      complete: true,
      order: 1,
    },
    {
      id: "prd-users",
      title: "Target Users",
      content: [
        `Primary users: ${session.targetUsers.join(", ") || "Product team"}`,
        ...answered.filter((item) => item.startsWith("Scope:")),
      ].join("\n"),
      complete: true,
      order: 2,
    },
    {
      id: "prd-scope",
      title: "Scope",
      content: scopeBullets.map((item) => `- ${item}`).join("\n"),
      complete: true,
      order: 3,
    },
    {
      id: "prd-risks",
      title: "Risks and Unknowns",
      content: [
        `- ${pickConstraint(session)}`,
        ...answered
          .filter((item) => item.startsWith("Dependencies:") || item.startsWith("Edge Cases:"))
          .map((item) => `- ${item}`),
      ].join("\n"),
      complete: true,
      order: 4,
    },
  ];
}

export function generateEpics(session: WorkflowDraft): Epic[] {
  const sections = session.prdSections.length > 0
    ? session.prdSections
    : generatePrdSections(session);

  const scope = sections.find((section) => section.id === "prd-scope")?.content ?? "";
  const risks = sections.find((section) => section.id === "prd-risks")?.content ?? "";

  return [
    {
      id: `${session.id}-epic-foundation`,
      sessionId: session.id,
      title: "Workflow foundation",
      businessObjective: "Create a reliable first-pass workflow from intake to review.",
      scopeSummary: scope || "Establish the first end-to-end path with clear saved progress.",
      prdRequirements: [prdRequirementId(0), prdRequirementId(1)],
      priority: "P1",
      dependencies: [],
      risks: [risks.split("\n")[0]?.replace(/^- /, "") || pickConstraint(session)],
      jiraEpicDescription:
        "Build the first stable workflow slice so PMs can move from intake into structured planning without losing context.",
      storyCount: 2,
    },
    {
      id: `${session.id}-epic-quality`,
      sessionId: session.id,
      title: "Quality and review signals",
      businessObjective: "Expose missing detail early so downstream teams trust the output.",
      scopeSummary: "Score readiness, explain warnings, and preserve actionable review context.",
      prdRequirements: [prdRequirementId(2), prdRequirementId(3)],
      priority: "P1",
      dependencies: [`${session.id}-epic-foundation`],
      risks: ["Low-quality inputs can still create vague output without explicit warnings."],
      jiraEpicDescription:
        "Add quality scoring and review loops so generated work is honest about risk before export.",
      storyCount: 2,
    },
  ];
}

function scoreLabel(total: number): ReadinessScore["label"] {
  if (total >= 90) return "Ready for Jira";
  if (total >= 75) return "Minor review needed";
  if (total >= 60) return "Needs PM refinement";
  return "Not ready";
}

function buildReadinessScore(story: Omit<Story, "readinessScore" | "warnings">): ReadinessScore {
  const clarity = Math.min(20, 10 + Math.min(10, Math.floor(story.description.length / 18)));
  const acceptanceCriteria = Math.min(
    20,
    8 + story.acceptanceCriteria.filter((criterion) => criterion.trim().length > 10).length * 4,
  );
  const businessAlignment = story.userStory.includes("As a") ? 13 : 9;
  const technicalFeasibility = story.technicalNotes ? 12 : 8;
  const testability = story.qaNotes ? 8 : 5;
  const edgeCasesErrorHandling =
    story.edgeCases.length > 0 && story.errorHandling ? 8 : 5;
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

function detectWarnings(story: Omit<Story, "warnings" | "readinessScore">): QualityWarning[] {
  const warnings: QualityWarning[] = [];

  if (story.acceptanceCriteria.length < 2) {
    warnings.push({
      id: `${story.id}-warning-ac`,
      type: "acceptance-criteria",
      message: "Acceptance criteria may be too thin for reliable engineering handoff.",
      severity: "warning",
    });
  }

  if (!story.technicalNotes.trim()) {
    warnings.push({
      id: `${story.id}-warning-tech`,
      type: "technical-notes",
      message: "Technical notes are missing; implementation assumptions may drift.",
      severity: "warning",
    });
  }

  if (!story.errorHandling.trim()) {
    warnings.push({
      id: `${story.id}-warning-errors`,
      type: "error-handling",
      message: "Error handling is underspecified for this story.",
      severity: "error",
    });
  }

  if (story.openQuestions.length > 0) {
    warnings.push({
      id: `${story.id}-warning-open`,
      type: "open-questions",
      message: `Open questions remain: ${story.openQuestions.join("; ")}`,
      severity: "info",
    });
  }

  return warnings;
}

type StoryDraft = Omit<Story, "readinessScore" | "warnings">;

export function generateStories(session: WorkflowDraft): Story[] {
  const epics = session.epics.length > 0 ? session.epics : generateEpics(session);

  const baseStories: StoryDraft[] = epics.flatMap((epic, epicIndex) => {
    const foundation = epicIndex * 2;

    return [
      {
        id: `${session.id}-story-${foundation + 1}`,
        epicId: epic.id,
        sessionId: session.id,
        title:
          epicIndex === 0
            ? "Capture intake and clarification state"
            : "Expose readiness scoring in workspace review",
        userStory:
          epicIndex === 0
            ? "As a PM, I want intake context preserved and clarified so later planning starts from grounded facts."
            : "As a reviewer, I want readiness scores with warnings so I can trust what is ready and what is risky.",
        description:
          epicIndex === 0
            ? "Store intake, target users, business goal, and clarification answers in a stable workflow record."
            : "Compute explainable story readiness and show warnings before export or review handoff.",
        acceptanceCriteria:
          epicIndex === 0
            ? [
                "Captured intake is available after refresh.",
                "Required clarification questions persist their latest answers.",
                "The workspace resumes in the current phase.",
              ]
            : [
                "Each generated story includes a readiness score.",
                "Warnings explain missing information or risk.",
                "Quality review can be rerun after edits.",
              ],
        priority: "P1",
        labels: session.labels.length > 0 ? session.labels : ["AI Workflow"],
        components:
          epicIndex === 0
            ? ["New Breakdown", "Workspace"]
            : ["Quality Review", "Stories"],
        dependencies: epicIndex === 0 ? [] : [`${session.id}-story-1`],
        edgeCases:
          epicIndex === 0
            ? ["Optional fields may be blank but should still persist cleanly."]
            : ["Low-detail stories should show warnings instead of false confidence."],
        errorHandling:
          epicIndex === 0
            ? "If persistence fails, keep the latest local answers visible until retry."
            : "If scoring fails, preserve prior saved stories and show a retryable error state.",
        localizationNotes: "",
        designNotes:
          epicIndex === 0
            ? "Keep save/progress feedback subtle."
            : "Warnings should be scannable without blocking deeper review.",
        analyticsNotes:
          epicIndex === 0
            ? "Track session creation and clarification completion."
            : "Track quality review reruns and warning counts.",
        qaNotes:
          epicIndex === 0
            ? "Refresh after answering a question and confirm the value returns."
            : "Verify warning counts update after story edits.",
        technicalNotes:
          epicIndex === 0
            ? "Reuse shared API contracts for persisted artifacts."
            : "Calculate score from deterministic rubric before any live model integration.",
        openQuestions:
          epicIndex === 0
            ? []
            : session.knownConstraints ? [] : ["Should this score threshold be configurable per workspace?"],
        reviewStatus: "pending",
      },
      {
        id: `${session.id}-story-${foundation + 2}`,
        epicId: epic.id,
        sessionId: session.id,
        title:
          epicIndex === 0
            ? "Generate structured PRD and epics"
            : "Protect prior generated output on failures",
        userStory:
          epicIndex === 0
            ? "As a PM, I want clarification answers transformed into structured planning artifacts so the team can move faster."
            : "As a PM, I want generation failures to keep prior output intact so I can retry without losing work.",
        description:
          epicIndex === 0
            ? "Transform clarified input into PRD sections and epics with business framing and requirement mapping."
            : "Persist generation status separately from artifacts so invalid runs do not overwrite trusted output.",
        acceptanceCriteria:
          epicIndex === 0
            ? [
                "Generated PRD sections are non-empty.",
                "Epics include business objective, risks, and requirement references.",
              ]
            : [
                "A failed generation attempt marks the step as failed or unavailable.",
                "Previously saved artifacts remain untouched after failure.",
                "The user can retry generation explicitly.",
              ],
        priority: "P1",
        labels: session.labels.length > 0 ? session.labels : ["AI Workflow"],
        components:
          epicIndex === 0 ? ["PRD", "Epics"] : ["API Server", "Workspace"],
        dependencies: epicIndex === 0 ? [`${session.id}-story-1`] : [`${session.id}-story-3`],
        edgeCases:
          epicIndex === 0
            ? ["Skipped optional answers should not block generation."]
            : ["Unavailable model mode should surface a clear explanation."],
        errorHandling:
          epicIndex === 0
            ? "If generation returns invalid sections, preserve the last saved draft."
            : "Write failure state only to generation metadata and allow explicit retry.",
        localizationNotes: "",
        designNotes: "",
        analyticsNotes: "",
        qaNotes:
          epicIndex === 0
            ? "Regenerate after changing clarification answers and confirm sections update."
            : "Simulate unavailable mode and confirm prior stories remain visible.",
        technicalNotes:
          epicIndex === 0
            ? "Validate generated sections and epics with schema contracts before saving."
            : "Keep generation metadata versioned by prompt so changes are inspectable.",
        openQuestions: [],
        reviewStatus: "pending",
      },
    ];
  });

  return baseStories.map((story) => {
    const warnings = detectWarnings(story);
    return {
      ...story,
      warnings,
      readinessScore: buildReadinessScore(story),
    };
  });
}

export function applyQualityReview(stories: Story[]): Story[] {
  return stories.map((story) => {
    const draft: StoryDraft = { ...story };

    return {
      ...draft,
      warnings: detectWarnings(draft),
      readinessScore: buildReadinessScore(draft),
    };
  });
}
