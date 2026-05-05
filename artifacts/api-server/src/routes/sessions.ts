import { Router, type IRouter } from "express";
import {
  CreateSessionBody,
  ListSessionsResponse,
  UpdateSessionArtifactsBody,
  UpdateSessionBody,
} from "@workspace/api-zod";
import {
  projectsTable,
  sessionsTable,
  workflowArtifactsTable,
} from "@workspace/db";
import { sendError, sendUnexpectedError } from "./error-response";
import {
  createProjectRecord,
  createSessionDefaults,
  ensureSeedData,
  getSessionWithArtifacts,
  listSessionsWithArtifacts,
  randomUUID,
  requireDatabase,
  eq,
  DEFAULT_PHASES,
} from "./persistence";

const router: IRouter = Router();

function normalizeArtifactsInput(
  input: ReturnType<typeof UpdateSessionArtifactsBody.parse>,
) {
  return {
    ...input,
    stories: input.stories?.map((story) => ({
      ...story,
      developerReview: story.developerReview
        ? {
            ...story.developerReview,
            timestamp: story.developerReview.timestamp.toISOString(),
          }
        : undefined,
    })),
  };
}

router.get("/sessions", async (_req, res) => {
  try {
    const db = requireDatabase();
    await ensureSeedData(db);
    const sessions = await listSessionsWithArtifacts(db);
    res.json(ListSessionsResponse.parse({ sessions }));
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

router.post("/sessions", async (req, res) => {
  try {
    const db = requireDatabase();
    const input = CreateSessionBody.parse(req.body);
    const project = await createProjectRecord(db, {
      name: input.name,
      jiraKey: input.jiraKey?.toUpperCase(),
    });

    const sessionId = randomUUID();
    const now = new Date();

    await db.insert(sessionsTable).values({
      id: sessionId,
      projectId: project.id,
      name: input.name,
      inputType: input.inputType,
      outputDepth: input.outputDepth,
      jiraKey: input.jiraKey?.toUpperCase() ?? "",
      targetUsers: input.targetUsers ?? [],
      businessGoal: input.businessGoal ?? "",
      knownConstraints: input.knownConstraints ?? "",
      labels: input.labels ?? [],
      rawInput: input.rawInput,
      currentPhase: "clarification",
      phases: DEFAULT_PHASES,
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(workflowArtifactsTable).values({
      sessionId,
      ...createSessionDefaults(),
      createdAt: now,
      updatedAt: now,
    });

    const session = await getSessionWithArtifacts(db, sessionId);
    res.status(201).json(session);
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

router.get("/sessions/:sessionId", async (req, res) => {
  try {
    const db = requireDatabase();
    const session = await getSessionWithArtifacts(db, req.params.sessionId);

    if (!session) {
      sendError(res, 404, "Session not found.");
      return;
    }

    res.json(session);
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

router.patch("/sessions/:sessionId", async (req, res) => {
  try {
    const db = requireDatabase();
    const input = UpdateSessionBody.parse(req.body);
    const [session] = await db
      .update(sessionsTable)
      .set({
        ...input,
        jiraKey: input.jiraKey?.toUpperCase(),
        updatedAt: new Date(),
      })
      .where(eq(sessionsTable.id, req.params.sessionId))
      .returning();

    if (!session) {
      sendError(res, 404, "Session not found.");
      return;
    }

    if (input.name || input.jiraKey !== undefined) {
      await db
        .update(projectsTable)
        .set({
          name: input.name ?? session.name,
          jiraKey: input.jiraKey?.toUpperCase() ?? session.jiraKey,
          updatedAt: new Date(),
        })
        .where(eq(projectsTable.id, session.projectId));
    }

    const updated = await getSessionWithArtifacts(db, req.params.sessionId);
    res.json(updated);
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

router.patch("/sessions/:sessionId/artifacts", async (req, res) => {
  try {
    const db = requireDatabase();
    const input = normalizeArtifactsInput(UpdateSessionArtifactsBody.parse(req.body));
    const [artifacts] = await db
      .update(workflowArtifactsTable)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(workflowArtifactsTable.sessionId, req.params.sessionId))
      .returning();

    if (!artifacts) {
      sendError(res, 404, "Session artifacts not found.");
      return;
    }

    await db
      .update(sessionsTable)
      .set({ updatedAt: new Date() })
      .where(eq(sessionsTable.id, req.params.sessionId));

    const updated = await getSessionWithArtifacts(db, req.params.sessionId);
    res.json(updated);
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

export default router;
