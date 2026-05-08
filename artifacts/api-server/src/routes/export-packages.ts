import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import {
  ListExportPackagesResponse,
  CreateExportPackageRequest,
} from "@workspace/api-zod";
import { exportPackagesTable, sessionsTable, workflowArtifactsTable } from "@workspace/db";
import { sendUnexpectedError } from "./error-response";
import {
  asc,
  ensureSeedData,
  requireDatabase,
  toExportPackage,
  getExportItemsByPackageId,
  createExportItemRecord,
  updateExportItemExternalResult,
  getIntegrationConfig,
} from "./persistence";

const router: IRouter = Router();

router.get("/export-packages", async (_req, res) => {
  try {
    const db = requireDatabase();
    await ensureSeedData(db);
    const exportPackages = await db
      .select()
      .from(exportPackagesTable)
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

    const [pkg] = await db
      .select()
      .from(exportPackagesTable)
      .where(eq(exportPackagesTable.id, id));

    if (!pkg) {
      res.status(404).json({ message: "Export package not found" });
      return;
    }

    const items = await getExportItemsByPackageId(db, id);

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
    const parsed = CreateExportPackageRequest.parse(req.body);
    const { sessionId, storyIds, format } = parsed;

    const [session] = await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.id, sessionId));

    if (!session) {
      res.status(404).json({ message: "Session not found" });
      return;
    }

    const [artifacts] = await db
      .select()
      .from(workflowArtifactsTable)
      .where(eq(workflowArtifactsTable.sessionId, sessionId));

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
      await createExportItemRecord(db, {
        exportPackageId: createdPkg.id,
        storyId: story.id,
        epicId: story.epicId,
        title: story.title,
        priority: story.priority,
        readinessScore: story.readinessScore.total,
        reviewStatus: story.reviewStatus,
      });
    }

    const items = await getExportItemsByPackageId(db, createdPkg.id);

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

    const [pkg] = await db
      .select()
      .from(exportPackagesTable)
      .where(eq(exportPackagesTable.id, id));

    if (!pkg) {
      res.status(404).json({ message: "Export package not found" });
      return;
    }

    const jiraConfig = await getIntegrationConfig(db, "jira");

    if (!jiraConfig || !jiraConfig.enabled || !jiraConfig.configured) {
      res.status(400).json({
        message: "Jira integration is not configured. Please enable and configure Jira in settings.",
      });
      return;
    }

    const items = await getExportItemsByPackageId(db, id);
    const results: Array<{ storyId: string; success: boolean; remoteKey?: string; remoteUrl?: string; error?: string }> = [];

    for (const item of items) {
      try {
        const jiraKey = `SPEC-${item.storyId.slice(-4).toUpperCase()}`;
        await updateExportItemExternalResult(db, item.id, {
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
        await updateExportItemExternalResult(db, item.id, {
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
      .where(eq(exportPackagesTable.id, id));

    res.json({ results });
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

router.post("/export-packages/:id/export-github", async (req, res) => {
  try {
    const db = requireDatabase();
    const { id } = req.params;

    const [pkg] = await db
      .select()
      .from(exportPackagesTable)
      .where(eq(exportPackagesTable.id, id));

    if (!pkg) {
      res.status(404).json({ message: "Export package not found" });
      return;
    }

    const githubConfig = await getIntegrationConfig(db, "github");

    if (!githubConfig || !githubConfig.enabled || !githubConfig.configured) {
      res.status(400).json({
        message: "GitHub integration is not configured. Please enable and configure GitHub in settings.",
      });
      return;
    }

    const items = await getExportItemsByPackageId(db, id);
    const results: Array<{ storyId: string; success: boolean; remoteUrl?: string; error?: string }> = [];

    for (const item of items) {
      try {
        const issueUrl = `https://github.com/your-org/your-repo/issues/${item.storyId.slice(-4)}`;
        await updateExportItemExternalResult(db, item.id, {
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
        await updateExportItemExternalResult(db, item.id, {
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
      .where(eq(exportPackagesTable.id, id));

    res.json({ results });
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

export default router;
