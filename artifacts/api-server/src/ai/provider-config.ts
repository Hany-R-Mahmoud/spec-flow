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

export const DEFAULT_AI_PROVIDER_BASE_URL = "https://api.openai.com/v1";

export function normalizeAiProviderBaseUrl(baseUrl: string | null | undefined): string {
  const trimmed = baseUrl?.trim();
  if (!trimmed) {
    return DEFAULT_AI_PROVIDER_BASE_URL;
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error("AI provider base URL must be a valid absolute URL.");
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("AI provider base URL must start with http:// or https://.");
  }

  return url.toString().replace(/\/+$/, "");
}

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
  baseUrl?: string;
  apiKey?: string;
  enabled: boolean;
};

export type AiProviderSecret = {
  provider: "openai";
  model: string;
  baseUrl: string;
  apiKey: string;
  row: AiProviderConfigRow;
};

export function defaultAiProviderConfig(): AiProviderConfig {
  return {
    id: null,
    provider: "openai",
    model: "gpt-4o-mini",
    baseUrl: DEFAULT_AI_PROVIDER_BASE_URL,
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
    baseUrl: normalizeAiProviderBaseUrl(row.baseUrl),
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
      : "Manual mode active. Continue organizing, reviewing, and exporting without AI generation.",
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
    ? Boolean(row?.encryptedApiKey && row.provider === "openai")
    : Boolean(publicConfig.configured);

  if (!row?.encryptedApiKey || !usable || row.provider !== "openai") {
    return null;
  }

  return {
    provider: "openai",
    model: row.model,
    baseUrl: normalizeAiProviderBaseUrl(row.baseUrl),
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
  const baseUrl = normalizeAiProviderBaseUrl(input.baseUrl ?? existing?.baseUrl);
  const apiKey = input.apiKey?.trim();
  const hasSecret = Boolean(existing?.encryptedApiKey && existing.keyVersion && existing.keyFingerprint && existing.keySuffix);
  const encryptedApiKey = apiKey
    ? encryptManagedSecret(apiKey)
    : existing?.encryptedApiKey ?? null;
  const keyVersion = apiKey ? getSecretKeyVersion() : existing?.keyVersion ?? null;
  const keyFingerprint = apiKey ? getSecretFingerprint(apiKey) : existing?.keyFingerprint ?? null;
  const keySuffix = apiKey ? getSecretSuffix(apiKey) : existing?.keySuffix ?? null;
  const values = {
    provider: input.provider,
    model: input.model.trim(),
    baseUrl,
    enabled: input.enabled,
    status: "validating",
    encryptedApiKey,
    keyVersion,
    keyFingerprint,
    keySuffix,
    lastValidatedAt: null,
    validationError: null,
    updatedAt: now,
  };

  if (!encryptedApiKey && !hasSecret) {
    throw new Error("AI provider key is required to save a new provider configuration.");
  }

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
