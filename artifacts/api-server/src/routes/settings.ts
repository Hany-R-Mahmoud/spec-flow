import { Router, type IRouter } from "express";
import { and } from "drizzle-orm";
import { GetSettingsResponse, UpdateSettingsBody } from "@workspace/api-zod";
import { settingsTable } from "@workspace/db";
import { sendUnexpectedError } from "./error-response.js";
import {
  ensureSeedData,
  eq,
  getSettingsId,
  requireDatabase,
  toSettings,
} from "./persistence.js";
import { requireAuthContext, requireMutableWorkspaceContext } from "./auth.js";

const router: IRouter = Router();

router.get("/settings", async (req, res) => {
  try {
    const db = requireDatabase();
    const auth = requireAuthContext(req, res);
    if (!auth) {
      return;
    }

    await ensureSeedData(db, auth.workspaceId);
    const [settings] = await db
      .select()
      .from(settingsTable)
      .where(and(
        eq(settingsTable.id, getSettingsId(auth.workspaceId)),
        eq(settingsTable.workspaceId, auth.workspaceId),
      ));

    res.json(GetSettingsResponse.parse(toSettings(settings)));
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

router.put("/settings", async (req, res) => {
  try {
    const db = requireDatabase();
    const auth = requireMutableWorkspaceContext(req, res);
    if (!auth) {
      return;
    }

    await ensureSeedData(db, auth.workspaceId);
    const input = UpdateSettingsBody.parse(req.body);
    const [settings] = await db
      .update(settingsTable)
      .set({
        ...input,
        jiraKey: input.jiraKey.toUpperCase(),
        updatedAt: new Date(),
        workspaceId: auth.workspaceId,
      })
      .where(and(
        eq(settingsTable.id, getSettingsId(auth.workspaceId)),
        eq(settingsTable.workspaceId, auth.workspaceId),
      ))
      .returning();

    res.json(toSettings(settings));
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

export default router;
