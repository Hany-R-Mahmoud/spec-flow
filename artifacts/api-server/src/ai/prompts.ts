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
        "Each story must include acceptance criteria, edge cases, error handling, and implementation notes.",
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
