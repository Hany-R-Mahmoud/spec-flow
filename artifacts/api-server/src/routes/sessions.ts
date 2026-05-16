import { Router, type IRouter } from "express";
import { and } from "drizzle-orm";
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
import { sendError, sendUnexpectedError } from "./error-response.js";
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
} from "./persistence.js";
import { requireAuthContext } from "./auth.js";

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

router.get("/sessions", async (req, res) => {
  try {
    const db = requireDatabase();
    const auth = requireAuthContext(req, res);
    if (!auth) {
      return;
    }

    await ensureSeedData(db, auth.workspaceId);
    const sessions = await listSessionsWithArtifacts(db, auth.workspaceId);
    res.json(ListSessionsResponse.parse({ sessions }));
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

router.post("/sessions", async (req, res) => {
  try {
    const db = requireDatabase();
    const auth = requireAuthContext(req, res);
    if (!auth) {
      return;
    }

    const input = CreateSessionBody.parse(req.body);
    const project = await createProjectRecord(db, auth.workspaceId, {
      name: input.name,
      jiraKey: input.jiraKey?.toUpperCase(),
    });

    const sessionId = randomUUID();
    const now = new Date();

    await db.insert(sessionsTable).values({
      id: sessionId,
      workspaceId: auth.workspaceId,
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
      workspaceId: auth.workspaceId,
      ...createSessionDefaults(),
      createdAt: now,
      updatedAt: now,
    });

    const session = await getSessionWithArtifacts(db, sessionId, auth.workspaceId);
    res.status(201).json(session);
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

router.get("/sessions/:sessionId", async (req, res) => {
  try {
    const db = requireDatabase();
    const auth = requireAuthContext(req, res);
    if (!auth) {
      return;
    }

    const session = await getSessionWithArtifacts(db, req.params.sessionId, auth.workspaceId);

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
    const auth = requireAuthContext(req, res);
    if (!auth) {
      return;
    }

    const input = UpdateSessionBody.parse(req.body);
    const [session] = await db
      .update(sessionsTable)
      .set({
        ...input,
        jiraKey: input.jiraKey?.toUpperCase(),
        updatedAt: new Date(),
      })
      .where(and(
        eq(sessionsTable.id, req.params.sessionId),
        eq(sessionsTable.workspaceId, auth.workspaceId),
      ))
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
        .where(and(
          eq(projectsTable.id, session.projectId),
          eq(projectsTable.workspaceId, auth.workspaceId),
        ));
    }

    const updated = await getSessionWithArtifacts(db, req.params.sessionId, auth.workspaceId);
    res.json(updated);
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

router.patch("/sessions/:sessionId/artifacts", async (req, res) => {
  try {
    const db = requireDatabase();
    const auth = requireAuthContext(req, res);
    if (!auth) {
      return;
    }

    const input = normalizeArtifactsInput(UpdateSessionArtifactsBody.parse(req.body));
    const [artifacts] = await db
      .update(workflowArtifactsTable)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(and(
        eq(workflowArtifactsTable.sessionId, req.params.sessionId),
        eq(workflowArtifactsTable.workspaceId, auth.workspaceId),
      ))
      .returning();

    if (!artifacts) {
      sendError(res, 404, "Session artifacts not found.");
      return;
    }

    await db
      .update(sessionsTable)
      .set({ updatedAt: new Date() })
      .where(and(
        eq(sessionsTable.id, req.params.sessionId),
        eq(sessionsTable.workspaceId, auth.workspaceId),
      ));

    const updated = await getSessionWithArtifacts(db, req.params.sessionId, auth.workspaceId);
    res.json(updated);
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

router.delete("/sessions/:sessionId", async (req, res) => {
  try {
    const db = requireDatabase();
    const auth = requireAuthContext(req, res);
    if (!auth) {
      return;
    }

    const [deleted] = await db
      .delete(sessionsTable)
      .where(and(
        eq(sessionsTable.id, req.params.sessionId),
        eq(sessionsTable.workspaceId, auth.workspaceId),
      ))
      .returning({ id: sessionsTable.id });

    if (!deleted) {
      sendError(res, 404, "Session not found.");
      return;
    }

    res.json({ id: deleted.id, deleted: true });
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

export default router;
