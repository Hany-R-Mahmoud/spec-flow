import { Router, type IRouter } from "express";
import { sendUnexpectedError } from "./error-response.js";
import {
  requireDatabase,
  getIntegrationConfigs,
  updateIntegrationConfigRecord,
} from "./persistence.js";
import { requireAuthContext, requireMutableWorkspaceContext } from "./auth.js";
import {
  IntegrationSecretSetupError,
  normalizeIntegrationConfigInput,
} from "../lib/integration-secrets.js";

const router: IRouter = Router();

router.get("/integrations/config", async (req, res) => {
  try {
    const db = requireDatabase();
    const auth = requireAuthContext(req, res);
    if (!auth) {
      return;
    }

    const configs = await getIntegrationConfigs(db, auth.workspaceId);

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
    const auth = requireMutableWorkspaceContext(req, res);
    if (!auth) {
      return;
    }

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

    let sanitizedConfig: Record<string, string>;
    try {
      sanitizedConfig = normalizeIntegrationConfigInput(type, config);
    } catch (error) {
      if (error instanceof IntegrationSecretSetupError) {
        res.status(500).json({ message: error.message });
        return;
      }

      throw error;
    }

    const result = await updateIntegrationConfigRecord(db, type, auth.workspaceId, {
      enabled,
      config: sanitizedConfig,
    });

    res.json(result);
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

export default router;
