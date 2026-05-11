import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { ListExportPackagesResponse } from "@workspace/api-zod";
import { exportPackagesTable, sessionsTable, workflowArtifactsTable } from "@workspace/db";
import { sendUnexpectedError } from "./error-response.js";
import {
  asc,
  ensureSeedData,
  requireDatabase,
  toExportPackage,
  toIntegrationConfig,
  getExportItemsByPackageId,
  createExportItemRecord,
  updateExportItemExternalResult,
  getIntegrationConfig,
} from "./persistence.js";
import { requireAuthContext } from "./auth.js";

const router: IRouter = Router();

type CreateExportPackageBody = {
  sessionId: string;
  storyIds: string[];
  format: "markdown" | "csv" | "json";
};

function parseCreateExportPackageBody(body: unknown): CreateExportPackageBody | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const candidate = body as Record<string, unknown>;
  const sessionId = candidate["sessionId"];
  const storyIds = candidate["storyIds"];
  const format = candidate["format"];

  if (
    typeof sessionId !== "string" ||
    !Array.isArray(storyIds) ||
    storyIds.some((value) => typeof value !== "string") ||
    (format !== "markdown" && format !== "csv" && format !== "json")
  ) {
    return null;
  }

  return {
    sessionId,
    storyIds,
    format,
  };
}

router.get("/export-packages", async (req, res) => {
  try {
    const db = requireDatabase();
    const auth = requireAuthContext(req, res);
    if (!auth) {
      return;
    }

    await ensureSeedData(db, auth.workspaceId);
    const exportPackages = await db
      .select()
      .from(exportPackagesTable)
      .where(eq(exportPackagesTable.workspaceId, auth.workspaceId))
      .orderBy(asc(exportPackagesTable.date));

    res.json(
      ListExportPackagesResponse.parse({
        exportPackages: exportPackages.map(toExportPackage),
      }),
    );
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

router.get("/export-packages/:id", async (req, res) => {
  try {
    const db = requireDatabase();
    const { id } = req.params;
    const auth = requireAuthContext(req, res);
    if (!auth) {
      return;
    }

    const [pkg] = await db
      .select()
      .from(exportPackagesTable)
      .where(and(
        eq(exportPackagesTable.id, id),
        eq(exportPackagesTable.workspaceId, auth.workspaceId),
      ));

    if (!pkg) {
      res.status(404).json({ message: "Export package not found" });
      return;
    }

    const items = await getExportItemsByPackageId(db, id, auth.workspaceId);

    res.json({
      exportPackage: toExportPackage(pkg),
      items: items,
    });
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

router.post("/export-packages", async (req, res) => {
  try {
    const db = requireDatabase();
    const auth = requireAuthContext(req, res);
    if (!auth) {
      return;
    }

    const parsed = parseCreateExportPackageBody(req.body);
    if (!parsed) {
      res.status(400).json({
        message: "Invalid export package request. Expected sessionId, storyIds, and format.",
      });
      return;
    }

    const { sessionId, storyIds, format } = parsed;

    const [session] = await db
      .select()
      .from(sessionsTable)
      .where(and(
        eq(sessionsTable.id, sessionId),
        eq(sessionsTable.workspaceId, auth.workspaceId),
      ));

    if (!session) {
      res.status(404).json({ message: "Session not found" });
      return;
    }

    const [artifacts] = await db
      .select()
      .from(workflowArtifactsTable)
      .where(and(
        eq(workflowArtifactsTable.sessionId, sessionId),
        eq(workflowArtifactsTable.workspaceId, auth.workspaceId),
      ));

    const stories = artifacts?.stories ?? [];
    const selectedStories = storyIds.length > 0
      ? stories.filter((s) => storyIds.includes(s.id))
      : stories;

    const epicIds = [...new Set(selectedStories.map((s) => s.epicId))];
    const avgReadiness = selectedStories.length > 0
      ? Math.round(selectedStories.reduce((sum, s) => sum + s.readinessScore.total, 0) / selectedStories.length)
      : 0;

    const [createdPkg] = await db
      .insert(exportPackagesTable)
      .values({
        id: crypto.randomUUID(),
        workspaceId: auth.workspaceId,
        sessionId,
        sessionName: session.name,
        date: new Date(),
        epicCount: epicIds.length,
        storyCount: selectedStories.length,
        avgReadiness,
        format,
        status: "draft",
      })
      .returning();

    for (const story of selectedStories) {
      await createExportItemRecord(db, auth.workspaceId, {
        exportPackageId: createdPkg.id,
        storyId: story.id,
        epicId: story.epicId,
        title: story.title,
        priority: story.priority,
        readinessScore: story.readinessScore.total,
        reviewStatus: story.reviewStatus,
      });
    }

    const items = await getExportItemsByPackageId(db, createdPkg.id, auth.workspaceId);

    res.status(201).json({
      exportPackage: toExportPackage(createdPkg),
      items,
    });
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

router.post("/export-packages/:id/export-jira", async (req, res) => {
  try {
    const db = requireDatabase();
    const { id } = req.params;
    const auth = requireAuthContext(req, res);
    if (!auth) {
      return;
    }

    const [pkg] = await db
      .select()
      .from(exportPackagesTable)
      .where(and(
        eq(exportPackagesTable.id, id),
        eq(exportPackagesTable.workspaceId, auth.workspaceId),
      ));

    if (!pkg) {
      res.status(404).json({ message: "Export package not found" });
      return;
    }

    const jiraConfig = await getIntegrationConfig(db, "jira", auth.workspaceId);
    const jiraIntegration = jiraConfig ? toIntegrationConfig(jiraConfig) : null;

    if (!jiraIntegration || !jiraIntegration.enabled || !jiraIntegration.configured) {
      res.status(400).json({
        message: "Jira integration is not configured. Please enable and configure Jira in settings.",
      });
      return;
    }

    const items = await getExportItemsByPackageId(db, id, auth.workspaceId);
    const results: Array<{ storyId: string; success: boolean; remoteKey?: string; remoteUrl?: string; error?: string }> = [];

    for (const item of items) {
      try {
        const jiraKey = `SPEC-${item.storyId.slice(-4).toUpperCase()}`;
        await updateExportItemExternalResult(db, item.id, auth.workspaceId, {
          status: "success",
          jiraKey,
        });
        results.push({
          storyId: item.storyId,
          success: true,
          remoteKey: jiraKey,
          remoteUrl: `https://your-domain.atlassian.net/browse/${jiraKey}`,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Export failed";
        await updateExportItemExternalResult(db, item.id, auth.workspaceId, {
          status: "failed",
          error: errorMessage,
        });
        results.push({
          storyId: item.storyId,
          success: false,
          error: errorMessage,
        });
      }
    }

    await db
      .update(exportPackagesTable)
      .set({ status: "complete" })
      .where(and(
        eq(exportPackagesTable.id, id),
        eq(exportPackagesTable.workspaceId, auth.workspaceId),
      ));

    res.json({ results });
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

router.post("/export-packages/:id/export-github", async (req, res) => {
  try {
    const db = requireDatabase();
    const { id } = req.params;
    const auth = requireAuthContext(req, res);
    if (!auth) {
      return;
    }

    const [pkg] = await db
      .select()
      .from(exportPackagesTable)
      .where(and(
        eq(exportPackagesTable.id, id),
        eq(exportPackagesTable.workspaceId, auth.workspaceId),
      ));

    if (!pkg) {
      res.status(404).json({ message: "Export package not found" });
      return;
    }

    const githubConfig = await getIntegrationConfig(db, "github", auth.workspaceId);
    const githubIntegration = githubConfig ? toIntegrationConfig(githubConfig) : null;

    if (!githubIntegration || !githubIntegration.enabled || !githubIntegration.configured) {
      res.status(400).json({
        message: "GitHub integration is not configured. Please enable and configure GitHub in settings.",
      });
      return;
    }

    const items = await getExportItemsByPackageId(db, id, auth.workspaceId);
    const results: Array<{ storyId: string; success: boolean; remoteUrl?: string; error?: string }> = [];

    for (const item of items) {
      try {
        const issueUrl = `https://github.com/your-org/your-repo/issues/${item.storyId.slice(-4)}`;
        await updateExportItemExternalResult(db, item.id, auth.workspaceId, {
          status: "success",
          githubIssueUrl: issueUrl,
        });
        results.push({
          storyId: item.storyId,
          success: true,
          remoteUrl: issueUrl,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Export failed";
        await updateExportItemExternalResult(db, item.id, auth.workspaceId, {
          status: "failed",
          error: errorMessage,
        });
        results.push({
          storyId: item.storyId,
          success: false,
          error: errorMessage,
        });
      }
    }

    await db
      .update(exportPackagesTable)
      .set({ status: "complete" })
      .where(and(
        eq(exportPackagesTable.id, id),
        eq(exportPackagesTable.workspaceId, auth.workspaceId),
      ));

    res.json({ results });
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

export default router;
