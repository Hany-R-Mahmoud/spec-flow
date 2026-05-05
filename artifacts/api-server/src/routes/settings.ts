import { Router, type IRouter } from "express";
import { GetSettingsResponse, UpdateSettingsBody } from "@workspace/api-zod";
import { settingsTable } from "@workspace/db";
import { sendUnexpectedError } from "./error-response";
import {
  DEFAULT_SETTINGS_ID,
  ensureSeedData,
  eq,
  requireDatabase,
  toSettings,
} from "./persistence";

const router: IRouter = Router();

router.get("/settings", async (_req, res) => {
  try {
    const db = requireDatabase();
    await ensureSeedData(db);
    const [settings] = await db
      .select()
      .from(settingsTable)
      .where(eq(settingsTable.id, DEFAULT_SETTINGS_ID));

    res.json(GetSettingsResponse.parse(toSettings(settings)));
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

router.put("/settings", async (req, res) => {
  try {
    const db = requireDatabase();
    await ensureSeedData(db);
    const input = UpdateSettingsBody.parse(req.body);
    const [settings] = await db
      .update(settingsTable)
      .set({
        ...input,
        jiraKey: input.jiraKey.toUpperCase(),
        updatedAt: new Date(),
      })
      .where(eq(settingsTable.id, DEFAULT_SETTINGS_ID))
      .returning();

    res.json(toSettings(settings));
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

export default router;
