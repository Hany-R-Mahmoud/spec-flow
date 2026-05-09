import { Router, type IRouter } from "express";
import { and } from "drizzle-orm";
import {
  CreateProjectBody,
  ListProjectsResponse,
  UpdateProjectBody,
} from "@workspace/api-zod";
import { projectsTable } from "@workspace/db";
import { sendError, sendUnexpectedError } from "./error-response";
import {
  createProjectRecord,
  ensureSeedData,
  eq,
  requireDatabase,
  toProject,
} from "./persistence";
import { requireAuthContext } from "./auth";

const router: IRouter = Router();

router.get("/projects", async (req, res) => {
  try {
    const db = requireDatabase();
    const auth = requireAuthContext(req, res);
    if (!auth) {
      return;
    }

    await ensureSeedData(db, auth.workspaceId);
    const projects = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.workspaceId, auth.workspaceId));

    res.json(ListProjectsResponse.parse({ projects: projects.map(toProject) }));
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

router.post("/projects", async (req, res) => {
  try {
    const db = requireDatabase();
    const auth = requireAuthContext(req, res);
    if (!auth) {
      return;
    }

    const input = CreateProjectBody.parse(req.body);
    const project = await createProjectRecord(db, auth.workspaceId, input);
    res.status(201).json(project);
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

router.get("/projects/:projectId", async (req, res) => {
  try {
    const db = requireDatabase();
    const auth = requireAuthContext(req, res);
    if (!auth) {
      return;
    }

    const [project] = await db
      .select()
      .from(projectsTable)
      .where(and(
        eq(projectsTable.id, req.params.projectId),
        eq(projectsTable.workspaceId, auth.workspaceId),
      ));

    if (!project) {
      sendError(res, 404, "Project not found.");
      return;
    }

    res.json(toProject(project));
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

router.patch("/projects/:projectId", async (req, res) => {
  try {
    const db = requireDatabase();
    const auth = requireAuthContext(req, res);
    if (!auth) {
      return;
    }

    const input = UpdateProjectBody.parse(req.body);
    const [project] = await db
      .update(projectsTable)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(and(
        eq(projectsTable.id, req.params.projectId),
        eq(projectsTable.workspaceId, auth.workspaceId),
      ))
      .returning();

    if (!project) {
      sendError(res, 404, "Project not found.");
      return;
    }

    res.json(toProject(project));
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

export default router;
