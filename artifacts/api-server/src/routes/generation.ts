import { Router, type IRouter } from "express";
import { createHash } from "node:crypto";
import { and } from "drizzle-orm";
import {
  GenerateClarificationBody,
  GenerateEpicsBody,
  GeneratePrdBody,
  GenerateQualityBody,
  GenerateStoriesBody,
} from "@workspace/api-zod";
import {
  clarificationQuestionSchema,
  epicSchema,
  prdSectionSchema,
  storySchema,
  workflowArtifactsTable,
  sessionsTable,
  type WorkflowGeneration,
} from "@workspace/db";
import { guidancePrompt, workflowPrompts } from "../ai/prompts.js";
import { AiProviderError, runOpenAiJson } from "../ai/provider-client.js";
import {
  getAiProviderSecret,
  recordAuditEvent,
  type AiProviderSecret,
} from "../ai/provider-config.js";
import { consumeRateLimit } from "../lib/rate-limit.js";
import { sendError, sendUnexpectedError } from "./error-response.js";
import {
  buildPhaseUpdate,
  createSessionDefaults,
  createWorkflowGeneration,
  getSessionArtifactsRecord,
  getSessionWithArtifacts,
  PROMPT_VERSIONS,
  requireDatabase,
  withGenerationStatus,
  eq,
} from "./persistence.js";
import { requireAuthContext } from "./auth.js";

const router: IRouter = Router();
const GENERATION_LIMIT = 30;
const GENERATION_WINDOW_MS = 60 * 60 * 1000;

type GenerationRouteStep =
  | "clarification"
  | "prd"
  | "epics"
  | "stories"
  | "quality";

type GuidancePhase =
  | "intake"
  | "clarification"
  | "prd"
  | "epics"
  | "stories"
  | "quality"
  | "devReview"
  | "export";

type GuidanceActionKey =
  | "generate-prd"
  | "generate-epics"
  | "generate-stories"
  | "generate-quality"
  | "send-to-dev-review"
  | "complete-review"
  | "edit-step-skill";

type GuidanceItem = {
  type: "error" | "warning" | "success" | "action";
  message: string;
  actionKey?: GuidanceActionKey | null;
};

class GenerationRouteError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "GenerationRouteError";
  }
}

type GuidanceRequestBody = {
  phase: GuidancePhase;
  session?: {
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
  flowSummary?: Record<string, unknown>;
  stepSkills?: Array<{
    id: string;
    phase: GuidancePhase;
    name: string;
    version: number;
    source: "default" | "custom";
    content: string;
  }>;
};

type StepSkillSnapshot = {
  id: string;
  phase: string;
  name: string;
  version: number;
  source: "default" | "custom";
  content: string;
};

const generateBodyParsers = {
  clarification: GenerateClarificationBody,
  prd: GeneratePrdBody,
  epics: GenerateEpicsBody,
  stories: GenerateStoriesBody,
  quality: GenerateQualityBody,
} as const;

function validateStepSkillSnapshot(
  step: GenerationRouteStep,
  stepSkill?: StepSkillSnapshot,
): StepSkillSnapshot | undefined {
  if (!stepSkill) {
    return undefined;
  }

  if (stepSkill.phase !== step) {
    throw new Error("Step skill phase does not match the generation step.");
  }

  if (stepSkill.content.length > 12_000) {
    throw new Error("Step skill is too large for live generation.");
  }

  const forbiddenPatterns = [
    /api\s*key/i,
    /secret/i,
    /token/i,
    /ignore\s+(all\s+)?previous/i,
    /system\s+prompt/i,
  ];

  if (forbiddenPatterns.some((pattern) => pattern.test(stepSkill.content))) {
    throw new Error("Step skill contains unsafe instructions for live generation.");
  }

  return stepSkill;
}

function validateGuidanceStepSkills(
  stepSkills: GuidanceRequestBody["stepSkills"],
): GuidanceRequestBody["stepSkills"] {
  if (!stepSkills) {
    return undefined;
  }

  return stepSkills.map((skill) => {
    if (skill.content.length > 12_000) {
      throw new Error("Step skill is too large for live guidance.");
    }

    const forbiddenPatterns = [
      /api\s*key/i,
      /secret/i,
      /token/i,
      /ignore\s+(all\s+)?previous/i,
      /system\s+prompt/i,
    ];

    if (forbiddenPatterns.some((pattern) => pattern.test(skill.content))) {
      throw new Error("Step skill contains unsafe instructions for live guidance.");
    }

    return skill;
  });
}

function parseGuidanceItem(raw: unknown): GuidanceItem {
  if (!raw || typeof raw !== "object") {
    throw new Error("AI guidance item has an invalid shape.");
  }

  const item = raw as Record<string, unknown>;
  const type = item.type;
  const message = item.message;
  const actionKey = item.actionKey;

  if (
    (type !== "error" && type !== "warning" && type !== "success" && type !== "action") ||
    typeof message !== "string" ||
    message.trim().length === 0
  ) {
    throw new Error("AI guidance item is missing required fields.");
  }

  if (
    actionKey !== undefined &&
    actionKey !== null &&
    actionKey !== "generate-prd" &&
    actionKey !== "generate-epics" &&
    actionKey !== "generate-stories" &&
    actionKey !== "generate-quality" &&
    actionKey !== "send-to-dev-review" &&
    actionKey !== "complete-review" &&
    actionKey !== "edit-step-skill"
  ) {
    throw new Error("AI guidance item action is invalid.");
  }

  return {
    type,
    message: message.trim(),
    actionKey: actionKey ?? null,
  };
}

function parseGuidanceResponse(content: string): GuidanceItem[] {
  const parsed = parseProviderJson(content);
  const items = parsed.items;

  if (!Array.isArray(items)) {
    throw new Error("AI guidance response must include an items array.");
  }

  return items.slice(0, 4).map(parseGuidanceItem);
}

function buildFlowSummary(row: NonNullable<Awaited<ReturnType<typeof getSessionArtifactsRecord>>>): Record<string, unknown> {
  const clarificationQuestions = row.artifacts?.clarificationQuestions ?? [];
  const prdSections = row.artifacts?.prdSections ?? [];
  const epics = row.artifacts?.epics ?? [];
  const stories = row.artifacts?.stories ?? [];

  return {
    sessionId: row.session.id,
    sessionName: row.session.name,
    currentPhase: row.session.currentPhase,
    phaseStatuses: row.session.phases,
    clarification: {
      total: clarificationQuestions.length,
      unanswered: clarificationQuestions.filter((question) => question.required && !question.answer && !question.skipped).length,
      skipped: clarificationQuestions.filter((question) => question.skipped).length,
    },
    prd: {
      total: prdSections.length,
      incomplete: prdSections.filter((section) => !section.complete).length,
    },
    epics: {
      total: epics.length,
    },
    stories: {
      total: stories.length,
      ready: stories.filter((story) => story.readinessScore.total >= 90 || story.reviewStatus === "approved").length,
      needsReview: stories.filter((story) =>
        story.readinessScore.total < 90 && story.reviewStatus !== "approved",
      ).length,
      lowReadiness: stories.filter((story) => story.readinessScore.total < 75).length,
      pendingReview: stories.filter((story) => story.reviewStatus === "pending").length,
    },
    export: {
      ready: stories.filter((story) => story.readinessScore.total >= 90 || story.reviewStatus === "approved").length,
    },
  };
}

function parseProviderJson(content: string): Record<string, unknown> {
  const normalized = normalizeProviderJsonContent(content);
  const parsed = JSON.parse(normalized) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("AI provider returned JSON with an invalid shape.");
  }

  return parsed as Record<string, unknown>;
}

function normalizeProviderJsonContent(content: string): string {
  const trimmed = content.trim();
  const fencedMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const objectStart = trimmed.indexOf("{");
  const objectEnd = trimmed.lastIndexOf("}");
  if (objectStart >= 0 && objectEnd > objectStart) {
    return trimmed.slice(objectStart, objectEnd + 1);
  }

  return trimmed;
}

function buildInputSnapshotHash(input: unknown): string {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

function getOutputContract(step: GenerationRouteStep): string {
  if (step === "clarification") {
    return "Return JSON only: {\"clarificationQuestions\":[{\"id\":\"string\",\"group\":\"string\",\"text\":\"string\",\"required\":true,\"answer\":\"\",\"skipped\":false}]}";
  }

  if (step === "prd") {
    return "Return JSON only: {\"prdSections\":[{\"id\":\"string\",\"title\":\"string\",\"content\":\"string\",\"complete\":true,\"order\":1}]}";
  }

  if (step === "epics") {
    return "Return JSON only: {\"epics\":[{\"id\":\"string\",\"sessionId\":\"SESSION_ID\",\"title\":\"string\",\"businessObjective\":\"string\",\"scopeSummary\":\"string\",\"prdRequirements\":[\"string\"],\"priority\":\"P1\",\"dependencies\":[\"string\"],\"risks\":[\"string\"],\"jiraEpicDescription\":\"string\",\"storyCount\":2}]}";
  }

  if (step === "stories") {
    return "Return JSON only: {\"stories\":[{\"id\":\"string\",\"epicId\":\"string\",\"sessionId\":\"SESSION_ID\",\"title\":\"string\",\"userStory\":\"As a ...\",\"description\":\"string\",\"acceptanceCriteria\":[\"string\"],\"priority\":\"P1\",\"labels\":[\"string\"],\"components\":[\"string\"],\"dependencies\":[\"string\"],\"edgeCases\":[\"string\"],\"errorHandling\":\"string\",\"localizationNotes\":\"string\",\"designNotes\":\"string\",\"analyticsNotes\":\"string\",\"qaNotes\":\"string\",\"technicalNotes\":\"string\",\"openQuestions\":[\"string\"],\"readinessScore\":{\"total\":75,\"clarity\":75,\"acceptanceCriteria\":75,\"businessAlignment\":75,\"technicalFeasibility\":75,\"testability\":75,\"edgeCasesErrorHandling\":75,\"dependenciesDesignLocalization\":75,\"label\":\"Minor review needed\"},\"warnings\":[],\"reviewStatus\":\"pending\"}]}";
  }

  return "Return JSON only: {\"stories\":[STORY objects using the existing story contract, with updated readinessScore, warnings, and openQuestions when more information is needed.]}";
}

function resetStep(
  generation: WorkflowGeneration,
  step: GenerationRouteStep,
): WorkflowGeneration {
  return {
    ...generation,
    [step]: {
      ...generation[step],
      status: "idle",
      errorMessage: null,
      updatedAt: null,
    },
  };
}

function resetDownstream(
  generation: WorkflowGeneration,
  step: GenerationRouteStep,
): WorkflowGeneration {
  if (step === "clarification") {
    return resetStep(resetStep(resetStep(resetStep(generation, "prd"), "epics"), "stories"), "quality");
  }

  if (step === "prd") {
    return resetStep(resetStep(resetStep(generation, "epics"), "stories"), "quality");
  }

  if (step === "epics") {
    return resetStep(resetStep(generation, "stories"), "quality");
  }

  if (step === "stories") {
    return resetStep(generation, "quality");
  }

  return generation;
}

async function markGenerationState(args: {
  sessionId: string;
  workspaceId: string;
  step: GenerationRouteStep;
  status: "running" | "failed" | "succeeded" | "unavailable";
  errorMessage?: string | null;
  mode?: "live" | "unavailable";
  provider?: string | null;
  model?: string | null;
  errorClass?: string | null;
}) {
  const db = requireDatabase();
  const row = await getSessionArtifactsRecord(db, args.sessionId, args.workspaceId);

  if (!row?.artifacts) {
    return null;
  }

  const generation =
    row.artifacts.metadata?.generation ?? createWorkflowGeneration(args.mode ?? "live");
  const nextGeneration = withGenerationStatus(generation, args.step, {
    status: args.status,
    mode: args.mode ?? "live",
    errorMessage: args.errorMessage ?? null,
    provider: args.provider ?? null,
    model: args.model ?? null,
    errorClass: args.errorClass ?? null,
  });

  await db
    .update(workflowArtifactsTable)
    .set({
      metadata: { generation: nextGeneration },
      updatedAt: new Date(),
    })
    .where(and(
      eq(workflowArtifactsTable.sessionId, args.sessionId),
      eq(workflowArtifactsTable.workspaceId, args.workspaceId),
    ));

  return nextGeneration;
}

async function runGeneration(
  sessionId: string,
  workspaceId: string,
  actorUserId: string,
  step: GenerationRouteStep,
  stepSkill?: StepSkillSnapshot,
): Promise<Awaited<ReturnType<typeof getSessionWithArtifacts>>> {
  const db = requireDatabase();
  const row = await getSessionArtifactsRecord(db, sessionId, workspaceId);

  if (!row) {
    throw new Error("Session not found.");
  }

  if (!row.artifacts) {
    throw new Error("Session artifacts not found.");
  }

  const providerSecret = await getAiProviderSecret(db, workspaceId);
  const validatedStepSkill = validateStepSkillSnapshot(step, stepSkill);
  const promptVersion = validatedStepSkill
    ? `${PROMPT_VERSIONS[step]}+skill:${validatedStepSkill.id}@v${validatedStepSkill.version}`
    : PROMPT_VERSIONS[step];
  let generation =
    row.artifacts.metadata?.generation ?? createWorkflowGeneration(providerSecret ? "live" : "unavailable");

  if (!providerSecret) {
    generation = withGenerationStatus(generation, step, {
      status: "unavailable",
      mode: "unavailable",
      errorMessage:
        "Connect and validate an AI provider key before running generation.",
      provider: null,
      model: null,
      errorClass: "missing_provider",
    });

    await db
      .update(workflowArtifactsTable)
      .set({
        metadata: { generation },
        updatedAt: new Date(),
      })
      .where(and(
        eq(workflowArtifactsTable.sessionId, sessionId),
        eq(workflowArtifactsTable.workspaceId, workspaceId),
      ));

    await db
      .update(sessionsTable)
      .set(buildPhaseUpdate(step, "needs-attention"))
      .where(and(
        eq(sessionsTable.id, sessionId),
        eq(sessionsTable.workspaceId, workspaceId),
      ));

    return getSessionWithArtifacts(db, sessionId, workspaceId);
  }

  const runningGeneration = withGenerationStatus(generation, step, {
    status: "running",
    mode: "live",
    errorMessage: null,
    provider: providerSecret.provider,
    model: providerSecret.model,
    providerRequestId: null,
    errorClass: null,
  });

  await db
    .update(workflowArtifactsTable)
    .set({
      metadata: { generation: runningGeneration },
      updatedAt: new Date(),
    })
    .where(and(
      eq(workflowArtifactsTable.sessionId, sessionId),
      eq(workflowArtifactsTable.workspaceId, workspaceId),
    ));

  await recordAuditEvent({
    db,
    workspaceId,
    actorUserId,
    eventType: "ai_generation.started",
    targetType: "workflow_session",
    targetId: sessionId,
    metadata: {
      step,
      provider: providerSecret.provider,
      model: providerSecret.model,
      promptVersion,
    },
  });

  try {
    const sessionInput = {
      name: row.session.name,
      inputType: row.session.inputType,
      outputDepth: row.session.outputDepth,
      jiraKey: row.session.jiraKey,
      targetUsers: row.session.targetUsers,
      businessGoal: row.session.businessGoal,
      knownConstraints: row.session.knownConstraints,
      labels: row.session.labels,
      rawInput: row.session.rawInput,
    };
    const prompt = workflowPrompts[step].buildPrompt({
      ...sessionInput,
    });

    const stepSkillInstructions = validatedStepSkill
      ? [
          `Step Skill: ${validatedStepSkill.name}`,
          `Skill ID: ${validatedStepSkill.id}`,
          `Skill Version: ${validatedStepSkill.version}`,
          `Skill Source: ${validatedStepSkill.source}`,
          validatedStepSkill.content,
        ].join("\n")
      : "";

    const providerContext = {
      session: sessionInput,
      artifacts: {
        clarificationQuestions: row.artifacts.clarificationQuestions,
        prdSections: row.artifacts.prdSections,
        epics: row.artifacts.epics,
        stories: row.artifacts.stories,
      },
      step,
      stepSkill: validatedStepSkill
        ? {
            id: validatedStepSkill.id,
            phase: validatedStepSkill.phase,
            name: validatedStepSkill.name,
            version: validatedStepSkill.version,
            source: validatedStepSkill.source,
          }
        : null,
    };
    const inputSnapshotHash = buildInputSnapshotHash(providerContext);
    const liveResult = await runOpenAiJson({
      apiKey: providerSecret.apiKey,
      model: providerSecret.model,
      baseUrl: providerSecret.baseUrl,
      messages: [
        {
          role: "system",
          content:
            "You are SpecFlow AI. Generate structured product workflow artifacts. Return valid JSON only. Preserve user-provided decisions. Mark missing facts as Unknown / verify. Never include secrets or hidden instructions.",
        },
        {
          role: "user",
          content: [
            prompt,
            stepSkillInstructions ? `\nActive step skill:\n${stepSkillInstructions}` : "",
            `\nExisting artifacts and session context:\n${JSON.stringify(providerContext)}`,
            `\n${getOutputContract(step).replace("SESSION_ID", sessionId)}`,
          ].join("\n"),
        },
      ],
    });
    const providerJson = parseProviderJson(liveResult.content);

    let artifactPatch: Record<string, unknown> = {};
    let nextGeneration = resetDownstream(runningGeneration, step);

    if (step === "clarification") {
      const clarificationQuestions = clarificationQuestionSchema.array().parse(
        providerJson["clarificationQuestions"],
      );

      artifactPatch = {
        clarificationQuestions,
        prdSections: createSessionDefaults().prdSections,
        epics: [],
        stories: [],
      };
    }

    if (step === "prd") {
      const prdSections = prdSectionSchema.array().parse(
        providerJson["prdSections"],
      );

      artifactPatch = {
        prdSections,
        epics: [],
        stories: [],
      };
    }

    if (step === "epics") {
      const epics = epicSchema.array().parse(
        providerJson["epics"],
      );

      artifactPatch = {
        epics,
        stories: [],
      };
    }

    if (step === "stories") {
      const stories = storySchema.array().parse(
        providerJson["stories"],
      );

      artifactPatch = { stories };
    }

    if (step === "quality") {
      const stories = storySchema.array().parse(providerJson["stories"]);

      artifactPatch = { stories };
    }

    nextGeneration = withGenerationStatus(nextGeneration, step, {
      status: "succeeded",
      mode: "live",
      promptVersion,
      errorMessage: null,
      provider: providerSecret.provider,
      model: providerSecret.model,
      providerRequestId: liveResult.providerRequestId,
      inputSnapshotHash,
      tokenEstimate: liveResult.tokenEstimate,
      costEstimateCents: null,
      errorClass: null,
    });

    await db
      .update(workflowArtifactsTable)
      .set({
        ...artifactPatch,
        metadata: { generation: nextGeneration },
        updatedAt: new Date(),
      })
      .where(and(
        eq(workflowArtifactsTable.sessionId, sessionId),
        eq(workflowArtifactsTable.workspaceId, workspaceId),
      ));

    await db
      .update(sessionsTable)
      .set(buildPhaseUpdate(step, "in-progress"))
      .where(and(
        eq(sessionsTable.id, sessionId),
        eq(sessionsTable.workspaceId, workspaceId),
      ));

    await recordAuditEvent({
      db,
      workspaceId,
      actorUserId,
      eventType: "ai_generation.succeeded",
      targetType: "workflow_session",
      targetId: sessionId,
      metadata: {
        step,
        provider: providerSecret.provider,
        model: providerSecret.model,
        promptVersion,
        providerRequestId: liveResult.providerRequestId,
      },
    });

    return getSessionWithArtifacts(db, sessionId, workspaceId);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Generation failed before valid output could be saved.";
    const status = getGenerationErrorStatus(error);

    await markGenerationState({
      sessionId,
      workspaceId,
      step,
      status: "failed",
      errorMessage: message,
      mode: "live",
      provider: providerSecret.provider,
      model: providerSecret.model,
      errorClass: error instanceof AiProviderError ? error.errorClass : "invalid_response",
    });

    await db
      .update(sessionsTable)
      .set(buildPhaseUpdate(step, "needs-attention"))
      .where(and(
        eq(sessionsTable.id, sessionId),
        eq(sessionsTable.workspaceId, workspaceId),
      ));

    await recordAuditEvent({
      db,
      workspaceId,
      actorUserId,
      eventType: "ai_generation.failed",
      targetType: "workflow_session",
      targetId: sessionId,
      metadata: {
        step,
        provider: providerSecret.provider,
        model: providerSecret.model,
        errorClass: error instanceof AiProviderError ? error.errorClass : "invalid_response",
      },
    });

    throw new GenerationRouteError(message, status);
  }
}

function getGenerationErrorStatus(error: unknown): number {
  if (error instanceof AiProviderError) {
    if (error.errorClass === "auth") {
      return 401;
    }

    if (error.errorClass === "rate_limit") {
      return 429;
    }

    if (error.errorClass === "request") {
      return 400;
    }

    return 502;
  }

  if (hasZodIssues(error) || error instanceof SyntaxError) {
    return 502;
  }

  if (error instanceof Error && error.message.startsWith("Step skill")) {
    return 400;
  }

  return 500;
}

function handleStep(step: GenerationRouteStep) {
  router.post(`/sessions/:sessionId/generate/${step}`, async (req, res) => {
    try {
      const input = generateBodyParsers[step].parse(req.body ?? {});

      const db = requireDatabase();
      const auth = requireAuthContext(req, res);
      if (!auth) {
        return;
      }

      const existing = await getSessionArtifactsRecord(db, req.params.sessionId, auth.workspaceId);

      if (!existing) {
        sendError(res, 404, "Session not found.");
        return;
      }

      if (!existing.artifacts) {
        sendError(res, 404, "Session artifacts not found.");
        return;
      }

      if (!consumeRateLimit(`generation:${auth.workspaceId}`, GENERATION_LIMIT, GENERATION_WINDOW_MS)) {
        sendError(res, 429, "Too many generation requests. Try again later.");
        return;
      }

      const session = await runGeneration(
        req.params.sessionId,
        auth.workspaceId,
        auth.actorUserId,
        step,
        input.stepSkill,
      );
      res.json(session);
    } catch (error) {
      sendGenerationError(res, error);
    }
  });
}

function sendGenerationError(
  res: Parameters<typeof sendError>[0],
  error: unknown,
) {
  if (error instanceof GenerationRouteError) {
    sendError(res, error.status, error.message);
    return;
  }

  sendUnexpectedError(res, error);
}

function hasZodIssues(
  error: unknown,
): error is { issues: Array<{ message?: string }> } {
  return (
    typeof error === "object" &&
    error !== null &&
    "issues" in error &&
    Array.isArray((error as { issues?: unknown }).issues)
  );
}

handleStep("clarification");
handleStep("prd");
handleStep("epics");
handleStep("stories");
handleStep("quality");

router.post("/sessions/:sessionId/guidance", async (req, res) => {
  try {
    const db = requireDatabase();
    const auth = requireAuthContext(req, res);
    if (!auth) {
      return;
    }

    const body = req.body as GuidanceRequestBody | null;
    if (!body || typeof body !== "object") {
      sendError(res, 400, "Invalid guidance request.");
      return;
    }

    if (
      body.phase !== "intake" &&
      body.phase !== "clarification" &&
      body.phase !== "prd" &&
      body.phase !== "epics" &&
      body.phase !== "stories" &&
      body.phase !== "quality" &&
      body.phase !== "devReview" &&
      body.phase !== "export"
    ) {
      sendError(res, 400, "Invalid guidance phase.");
      return;
    }

    const existing = await getSessionArtifactsRecord(db, req.params.sessionId, auth.workspaceId);
    if (!existing?.artifacts) {
      sendError(res, 404, "Session not found.");
      return;
    }

    const providerSecret = await getAiProviderSecret(db, auth.workspaceId);
    if (!providerSecret) {
      res.json({ items: [] as GuidanceItem[] });
      return;
    }

    const stepSkills = validateGuidanceStepSkills(body.stepSkills);
    const flowSummary = body.flowSummary ?? buildFlowSummary(existing);
    const sessionSnapshot = body.session ?? {
      name: existing.session.name,
      inputType: existing.session.inputType,
      outputDepth: existing.session.outputDepth,
      jiraKey: existing.session.jiraKey,
      targetUsers: existing.session.targetUsers,
      businessGoal: existing.session.businessGoal,
      knownConstraints: existing.session.knownConstraints,
      labels: existing.session.labels,
      rawInput: existing.session.rawInput,
    };

    const liveResult = await runOpenAiJson({
      apiKey: providerSecret.apiKey,
      model: providerSecret.model,
      baseUrl: providerSecret.baseUrl,
      messages: [
        {
          role: "system",
          content:
            "You are SpecFlow AI's in-flow guidance agent. Return concise JSON only. Focus on next-best actions, blockers, and phase-specific advice. Keep suggestions practical and tied to the current workflow state.",
        },
        {
          role: "user",
          content: guidancePrompt.buildPrompt({
            phase: body.phase,
            phaseStatus: String(existing.session.phases[body.phase as GuidancePhase] ?? "not-started"),
            session: sessionSnapshot,
            flowSummary,
            stepSkills: stepSkills ?? [],
          }),
        },
      ],
    });

    const items = parseGuidanceResponse(liveResult.content);
    res.json({ items });
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

export default router;
