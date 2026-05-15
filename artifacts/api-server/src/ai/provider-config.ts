import { and } from "drizzle-orm";
import {
  aiProviderConfigTable,
  auditEventsTable,
  aiProviderStatusSchema,
  getDb,
  type AiProviderConfigRow,
  type AiProviderStatus,
} from "@workspace/db";
import type { AiCapability, AiProviderConfig } from "@workspace/api-zod";
import {
  decryptManagedSecret,
  encryptManagedSecret,
  getSecretFingerprint,
  getSecretKeyVersion,
  getSecretSuffix,
} from "../lib/integration-secrets.js";
import { eq, randomUUID } from "../routes/persistence.js";

type Database = ReturnType<typeof getDb>;

export function isAiProviderStorageMissingError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  if ("code" in error && error.code === "42P01") {
    return true;
  }

  if (
    "cause" in error &&
    error.cause &&
    typeof error.cause === "object" &&
    "code" in error.cause &&
    error.cause.code === "42P01"
  ) {
    return true;
  }

  return error instanceof Error && error.message.includes("relation \"ai_provider_config\" does not exist");
}

export type AiProviderInput = {
  provider: "openai";
  model: string;
  apiKey: string;
  enabled: boolean;
};

export type AiProviderSecret = {
  provider: "openai";
  model: string;
  apiKey: string;
  row: AiProviderConfigRow;
};

export function defaultAiProviderConfig(): AiProviderConfig {
  return {
    id: null,
    provider: "openai",
    model: "gpt-4o-mini",
    enabled: false,
    status: "not_configured",
    configured: false,
    keyFingerprint: null,
    keySuffix: null,
    lastValidatedAt: null,
    validationError: null,
    updatedAt: null,
  };
}

export function toPublicAiProviderConfig(
  row: AiProviderConfigRow | null,
): AiProviderConfig {
  if (!row) {
    return defaultAiProviderConfig();
  }

  const status = aiProviderStatusSchema.safeParse(row.status).success
    ? (row.status as AiProviderStatus)
    : "validation_failed";

  return {
    id: row.id,
    provider: row.provider,
    model: row.model,
    enabled: row.enabled,
    status,
    configured: Boolean(row.enabled && row.encryptedApiKey && status === "configured"),
    keyFingerprint: row.keyFingerprint,
    keySuffix: row.keySuffix,
    lastValidatedAt: row.lastValidatedAt,
    validationError: row.validationError,
    updatedAt: row.updatedAt,
  };
}

export function getAiCapabilityFromConfig(
  config: AiProviderConfig,
): AiCapability {
  const canGenerate = config.configured && config.enabled && config.status === "configured";
  return {
    mode: canGenerate ? "ai_enabled" : "manual",
    canGenerate,
    canEditSkills: canGenerate,
    provider: config,
    reason: canGenerate
      ? "AI generation is enabled for this workspace."
      : "Connect and validate an AI provider key to enable generation and custom skills.",
  };
}

export async function getAiProviderConfigRow(
  db: Database,
  workspaceId: string,
): Promise<AiProviderConfigRow | null> {
  try {
    const [row] = await db
      .select()
      .from(aiProviderConfigTable)
      .where(eq(aiProviderConfigTable.workspaceId, workspaceId));

    return row ?? null;
  } catch (error) {
    if (isAiProviderStorageMissingError(error)) {
      return null;
    }

    throw error;
  }
}

export async function getAiProviderSecret(
  db: Database,
  workspaceId: string,
  options: { allowUnvalidated?: boolean } = {},
): Promise<AiProviderSecret | null> {
  const row = await getAiProviderConfigRow(db, workspaceId);
  const publicConfig = toPublicAiProviderConfig(row);
  const usable = options.allowUnvalidated
    ? Boolean(row?.encryptedApiKey && row.enabled && row.provider === "openai")
    : Boolean(publicConfig.configured);

  if (!row?.encryptedApiKey || !usable || row.provider !== "openai") {
    return null;
  }

  return {
    provider: "openai",
    model: row.model,
    apiKey: decryptManagedSecret(row.encryptedApiKey),
    row,
  };
}

export async function saveAiProviderConfig(
  db: Database,
  workspaceId: string,
  input: AiProviderInput,
): Promise<AiProviderConfigRow> {
  const existing = await getAiProviderConfigRow(db, workspaceId);
  const now = new Date();
  const values = {
    provider: input.provider,
    model: input.model.trim(),
    enabled: input.enabled,
    status: "validating",
    encryptedApiKey: encryptManagedSecret(input.apiKey),
    keyVersion: getSecretKeyVersion(),
    keyFingerprint: getSecretFingerprint(input.apiKey),
    keySuffix: getSecretSuffix(input.apiKey),
    lastValidatedAt: null,
    validationError: null,
    updatedAt: now,
  };

  if (existing) {
    const [updated] = await db
      .update(aiProviderConfigTable)
      .set(values)
      .where(eq(aiProviderConfigTable.workspaceId, workspaceId))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(aiProviderConfigTable)
    .values({
      id: randomUUID(),
      workspaceId,
      ...values,
      createdAt: now,
    })
    .returning();
  return created;
}

export async function markAiProviderValidation(
  db: Database,
  workspaceId: string,
  status: Extract<AiProviderStatus, "configured" | "validation_failed" | "disabled">,
  validationError: string | null,
): Promise<AiProviderConfigRow | null> {
  const [updated] = await db
    .update(aiProviderConfigTable)
    .set({
      status,
      enabled: status === "configured",
      validationError,
      lastValidatedAt: status === "configured" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(aiProviderConfigTable.workspaceId, workspaceId))
    .returning();

  return updated ?? null;
}

export async function deleteAiProviderConfig(
  db: Database,
  workspaceId: string,
): Promise<void> {
  await db
    .delete(aiProviderConfigTable)
    .where(eq(aiProviderConfigTable.workspaceId, workspaceId));
}

export async function recordAuditEvent(args: {
  db: Database;
  workspaceId: string;
  actorUserId: string;
  eventType: string;
  targetType: string;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await args.db.insert(auditEventsTable).values({
      id: randomUUID(),
      workspaceId: args.workspaceId,
      actorUserId: args.actorUserId,
      eventType: args.eventType,
      targetType: args.targetType,
      targetId: args.targetId ?? null,
      metadata: args.metadata ?? {},
      createdAt: new Date(),
    });
  } catch (error) {
    if (isAiProviderStorageMissingError(error)) {
      return;
    }

    throw error;
  }
}
