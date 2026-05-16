import type { Phase } from "@workspace/api-zod";

type WorkflowPromptContext = {
  name: string;
  inputType: string;
  outputDepth: string;
  jiraKey: string;
  targetUsers: string[];
  businessGoal: string;
  knownConstraints: string;
  labels: string[];
  rawInput: string;
};

export type WorkflowPrompt = {
  version: string;
  phase: Phase;
  buildPrompt: (session: WorkflowPromptContext) => string;
};

export type GuidancePromptContext = {
  phase: Phase;
  phaseStatus: string;
  session: WorkflowPromptContext;
  flowSummary: Record<string, unknown>;
  stepSkills: Array<{
    id: string;
    phase: string;
    name: string;
    version: number;
    source: "default" | "custom";
    content: string;
  }>;
};

function summarizeSession(session: WorkflowPromptContext): string {
  return [
    `Session: ${session.name}`,
    `Input type: ${session.inputType}`,
    `Output depth: ${session.outputDepth}`,
    `Jira key: ${session.jiraKey || "n/a"}`,
    `Target users: ${session.targetUsers.join(", ") || "n/a"}`,
    `Business goal: ${session.businessGoal || "n/a"}`,
    `Constraints: ${session.knownConstraints || "n/a"}`,
    `Labels: ${session.labels.join(", ") || "n/a"}`,
    `Raw input: ${session.rawInput}`,
  ].join("\n");
}

export const workflowPrompts = {
  clarification: {
    version: "clarification-v1",
    phase: "clarification",
    buildPrompt(session) {
      return [
        "Generate grouped clarification questions for a PM workflow.",
        "Focus on scope, success metrics, operational constraints, and edge cases.",
        "Return concise, answerable prompts that improve later PRD quality.",
        summarizeSession(session),
      ].join("\n\n");
    },
  },
  prd: {
    version: "prd-v1",
    phase: "prd",
    buildPrompt(session) {
      return [
        "Generate a compact PRD from answered clarification questions.",
        "Sections should cover problem statement, target users, scope, and risks.",
        "Keep text inspectable and editable by a PM.",
        summarizeSession(session),
      ].join("\n\n");
    },
  },
  epics: {
    version: "epics-v1",
    phase: "epics",
    buildPrompt(session) {
      return [
        "Generate Jira-ready epics from the PRD.",
        "Each epic needs business objective, scope summary, risks, and requirement mapping.",
        summarizeSession(session),
      ].join("\n\n");
    },
  },
  stories: {
    version: "stories-v1",
    phase: "stories",
    buildPrompt(session) {
      return [
        "Generate implementation-ready user stories from epics and PRD.",
        "Generate at most 6 total stories and at most 2 stories per epic; prioritize the most important implementation path.",
        "Keep each story concise: 2-4 acceptance criteria, 1-2 edge cases, and short notes.",
        "Use Unknown / verify for missing facts instead of expanding with speculation.",
        summarizeSession(session),
      ].join("\n\n");
    },
  },
  quality: {
    version: "quality-v1",
    phase: "quality",
    buildPrompt(session) {
      return [
        "Score story readiness and explain warnings.",
        "Penalize vague acceptance criteria, unclear dependencies, and missing operational notes.",
        summarizeSession(session),
      ].join("\n\n");
    },
  },
} satisfies Record<string, WorkflowPrompt>;

export const guidancePrompt = {
  version: "guidance-v1",
  buildPrompt(context: GuidancePromptContext) {
    return [
      "Generate concise AI guidance items for the current workflow phase and the whole breakdown flow.",
      "Return JSON only in this shape: {\"items\":[{\"type\":\"action\"|\"success\"|\"warning\"|\"error\",\"message\":\"string\",\"actionKey\":\"generate-prd\"|\"generate-epics\"|\"generate-stories\"|\"generate-quality\"|\"send-to-dev-review\"|\"complete-review\"|\"edit-step-skill\"|null}]}",
      "Rules:",
      "- Max 4 items.",
      "- Prefer the next best action.",
      "- Mention blockers, quality gaps, or next workflow step.",
      "- Use actionKey only when the UI can perform that action.",
      "- Keep messages short and specific.",
      "Context:",
      JSON.stringify(context),
    ].join("\n\n");
  },
} as const;
