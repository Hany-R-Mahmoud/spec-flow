import { Router, type IRouter } from "express";
import {
  DeleteAiProviderResponse,
  GetAiCapabilityResponse,
  GetAiProviderResponse,
  RotateAiProviderBody,
  RotateAiProviderResponse,
  UpdateAiProviderBody,
  UpdateAiProviderResponse,
  ValidateAiProviderResponse,
} from "@workspace/api-zod";
import {
  deleteAiProviderConfig,
  getAiCapabilityFromConfig,
  getAiProviderConfigRow,
  getAiProviderSecret,
  markAiProviderValidation,
  recordAuditEvent,
  saveAiProviderConfig,
  toPublicAiProviderConfig,
} from "../ai/provider-config.js";
import { AiProviderError, validateOpenAiKey } from "../ai/provider-client.js";
import { consumeRateLimit } from "../lib/rate-limit.js";
import { sendError, sendUnexpectedError } from "./error-response.js";
import { requireAuthContext, requireMutableWorkspaceContext } from "./auth.js";
import { requireDatabase } from "./persistence.js";

const router: IRouter = Router();
const VALIDATION_LIMIT = 8;
const VALIDATION_WINDOW_MS = 10 * 60 * 1000;

async function validateSavedProvider(args: {
  workspaceId: string;
  actorUserId: string;
}) {
  const db = requireDatabase();
  const secret = await getAiProviderSecret(db, args.workspaceId, {
    allowUnvalidated: true,
  });

  if (!secret) {
    const row = await markAiProviderValidation(
      db,
      args.workspaceId,
      "validation_failed",
      "No saved AI provider key is available.",
    );
    return toPublicAiProviderConfig(row);
  }

  try {
    await validateOpenAiKey({ apiKey: secret.apiKey, model: secret.model });
    const row = await markAiProviderValidation(db, args.workspaceId, "configured", null);
    await recordAuditEvent({
      db,
      workspaceId: args.workspaceId,
      actorUserId: args.actorUserId,
      eventType: "ai_provider.validate.success",
      targetType: "ai_provider_config",
      targetId: secret.row.id,
      metadata: { provider: secret.provider, model: secret.model },
    });
    return toPublicAiProviderConfig(row);
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI provider validation failed.";
    const row = await markAiProviderValidation(
      db,
      args.workspaceId,
      "validation_failed",
      message,
    );
    await recordAuditEvent({
      db,
      workspaceId: args.workspaceId,
      actorUserId: args.actorUserId,
      eventType: "ai_provider.validate.failed",
      targetType: "ai_provider_config",
      targetId: secret.row.id,
      metadata: {
        provider: secret.provider,
        model: secret.model,
        errorClass: error instanceof AiProviderError ? error.errorClass : "unknown",
      },
    });
    return toPublicAiProviderConfig(row);
  }
}

router.get("/ai/provider", async (req, res) => {
  try {
    const db = requireDatabase();
    const auth = requireAuthContext(req, res);
    if (!auth) {
      return;
    }

    const row = await getAiProviderConfigRow(db, auth.workspaceId);
    res.json(GetAiProviderResponse.parse(toPublicAiProviderConfig(row)));
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

router.put("/ai/provider", async (req, res) => {
  try {
    const db = requireDatabase();
    const auth = requireMutableWorkspaceContext(req, res);
    if (!auth) {
      return;
    }

    if (!consumeRateLimit(`ai-provider-save:${auth.workspaceId}`, VALIDATION_LIMIT, VALIDATION_WINDOW_MS)) {
      sendError(res, 429, "Too many provider credential attempts. Try again later.");
      return;
    }

    const input = UpdateAiProviderBody.parse(req.body);
    const row = await saveAiProviderConfig(db, auth.workspaceId, {
      provider: input.provider,
      model: input.model,
      apiKey: input.apiKey,
      enabled: input.enabled,
    });

    await recordAuditEvent({
      db,
      workspaceId: auth.workspaceId,
      actorUserId: auth.actorUserId,
      eventType: "ai_provider.save",
      targetType: "ai_provider_config",
      targetId: row.id,
      metadata: { provider: row.provider, model: row.model, enabled: row.enabled },
    });

    const validated = await validateSavedProvider({
      workspaceId: auth.workspaceId,
      actorUserId: auth.actorUserId,
    });
    res.json(UpdateAiProviderResponse.parse(validated));
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

router.delete("/ai/provider", async (req, res) => {
  try {
    const db = requireDatabase();
    const auth = requireMutableWorkspaceContext(req, res);
    if (!auth) {
      return;
    }

    const row = await getAiProviderConfigRow(db, auth.workspaceId);
    await deleteAiProviderConfig(db, auth.workspaceId);
    await recordAuditEvent({
      db,
      workspaceId: auth.workspaceId,
      actorUserId: auth.actorUserId,
      eventType: "ai_provider.delete",
      targetType: "ai_provider_config",
      targetId: row?.id ?? null,
      metadata: { provider: row?.provider ?? "openai" },
    });

    res.json(DeleteAiProviderResponse.parse(toPublicAiProviderConfig(null)));
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

router.post("/ai/provider/validate", async (req, res) => {
  try {
    const auth = requireMutableWorkspaceContext(req, res);
    if (!auth) {
      return;
    }

    if (!consumeRateLimit(`ai-provider-validate:${auth.workspaceId}`, VALIDATION_LIMIT, VALIDATION_WINDOW_MS)) {
      sendError(res, 429, "Too many provider validation attempts. Try again later.");
      return;
    }

    const validated = await validateSavedProvider({
      workspaceId: auth.workspaceId,
      actorUserId: auth.actorUserId,
    });
    res.json(ValidateAiProviderResponse.parse(validated));
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

router.post("/ai/provider/rotate", async (req, res) => {
  try {
    const db = requireDatabase();
    const auth = requireMutableWorkspaceContext(req, res);
    if (!auth) {
      return;
    }

    if (!consumeRateLimit(`ai-provider-rotate:${auth.workspaceId}`, VALIDATION_LIMIT, VALIDATION_WINDOW_MS)) {
      sendError(res, 429, "Too many provider rotation attempts. Try again later.");
      return;
    }

    const input = RotateAiProviderBody.parse(req.body);
    const existing = await getAiProviderConfigRow(db, auth.workspaceId);
    const row = await saveAiProviderConfig(db, auth.workspaceId, {
      provider: "openai",
      model: existing?.model ?? "gpt-4o-mini",
      apiKey: input.apiKey,
      enabled: existing?.enabled ?? true,
    });
    await recordAuditEvent({
      db,
      workspaceId: auth.workspaceId,
      actorUserId: auth.actorUserId,
      eventType: "ai_provider.rotate",
      targetType: "ai_provider_config",
      targetId: row.id,
      metadata: { provider: row.provider, model: row.model },
    });

    const validated = await validateSavedProvider({
      workspaceId: auth.workspaceId,
      actorUserId: auth.actorUserId,
    });
    res.json(RotateAiProviderResponse.parse(validated));
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

router.get("/ai/capability", async (req, res) => {
  try {
    const db = requireDatabase();
    const auth = requireAuthContext(req, res);
    if (!auth) {
      return;
    }

    const row = await getAiProviderConfigRow(db, auth.workspaceId);
    const config = toPublicAiProviderConfig(row);
    res.json(GetAiCapabilityResponse.parse(getAiCapabilityFromConfig(config)));
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

export default router;
