import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { integrationConfigTable } from "@workspace/db";
import { sendUnexpectedError } from "./error-response";
import {
  requireDatabase,
  getIntegrationConfigs,
  updateIntegrationConfigRecord,
  toIntegrationConfig,
} from "./persistence";

const router: IRouter = Router();

router.get("/integrations/config", async (_req, res) => {
  try {
    const db = requireDatabase();
    const configs = await getIntegrationConfigs(db);

    const defaultIntegrations = [
      { id: "jira", integrationType: "jira", enabled: false, configured: false },
      { id: "github", integrationType: "github", enabled: false, configured: false },
    ];

    const merged = defaultIntegrations.map((defaultCfg) => {
      const existing = configs.find((c) => c.integrationType === defaultCfg.integrationType);
      return existing ?? defaultCfg;
    });

    res.json({ integrations: merged });
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

router.put("/integrations/config/:type", async (req, res) => {
  try {
    const db = requireDatabase();
    const { type } = req.params;
    const { enabled, config } = req.body;

    if (typeof enabled !== "boolean") {
      res.status(400).json({ message: "enabled must be a boolean" });
      return;
    }

    if (type !== "jira" && type !== "github") {
      res.status(400).json({ message: "Invalid integration type. Must be 'jira' or 'github'." });
      return;
    }

    const validKeys = type === "jira"
      ? ["domain", "email", "apiToken", "projectKey"]
      : ["owner", "repo", "token"];

    const sanitizedConfig: Record<string, string> = {};
    if (config && typeof config === "object") {
      for (const key of validKeys) {
        if (config[key] && typeof config[key] === "string" && config[key].length > 0) {
          sanitizedConfig[key] = config[key];
        }
      }
    }

    const result = await updateIntegrationConfigRecord(db, type, {
      enabled,
      config: sanitizedConfig,
    });

    res.json(result);
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

export default router;