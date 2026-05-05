import { Router, type IRouter } from "express";
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

const router: IRouter = Router();

router.get("/projects", async (_req, res) => {
  try {
    const db = requireDatabase();
    await ensureSeedData(db);
    const projects = await db.select().from(projectsTable);

    res.json(ListProjectsResponse.parse({ projects: projects.map(toProject) }));
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

router.post("/projects", async (req, res) => {
  try {
    const db = requireDatabase();
    const input = CreateProjectBody.parse(req.body);
    const project = await createProjectRecord(db, input);
    res.status(201).json(project);
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

router.get("/projects/:projectId", async (req, res) => {
  try {
    const db = requireDatabase();
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, req.params.projectId));

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
    const input = UpdateProjectBody.parse(req.body);
    const [project] = await db
      .update(projectsTable)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(projectsTable.id, req.params.projectId))
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
