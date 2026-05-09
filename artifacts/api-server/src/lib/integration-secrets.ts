import { createCipheriv, createHash, randomBytes } from "node:crypto";

export class IntegrationSecretSetupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IntegrationSecretSetupError";
  }
}

const INTEGRATION_CONFIG_KEYS = {
  jira: {
    public: ["domain", "email", "projectKey"],
    secret: ["apiToken"],
  },
  github: {
    public: ["owner", "repo"],
    secret: ["token"],
  },
} as const;

type IntegrationType = keyof typeof INTEGRATION_CONFIG_KEYS;

function getEncryptionKey(): Buffer | null {
  const key = process.env.INTEGRATION_SECRET_ENCRYPTION_KEY?.trim();
  if (!key) {
    return null;
  }

  return createHash("sha256").update(key).digest();
}

function encryptSecretValue(value: string, key: Buffer): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    "enc:v1",
    iv.toString("base64"),
    tag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
}

export function normalizeIntegrationConfigInput(
  type: string,
  input: unknown,
): Record<string, string> {
  if (type !== "jira" && type !== "github") {
    throw new IntegrationSecretSetupError("Invalid integration type.");
  }

  const keys = INTEGRATION_CONFIG_KEYS[type as IntegrationType];
  const valueRecord =
    input && typeof input === "object"
      ? (input as Record<string, unknown>)
      : {};
  const encryptionKey = getEncryptionKey();
  const config: Record<string, string> = {};

  for (const key of keys.public) {
    const value = valueRecord[key];
    if (typeof value === "string" && value.trim().length > 0) {
      config[key] = value.trim();
    }
  }

  for (const key of keys.secret) {
    const value = valueRecord[key];
    if (typeof value !== "string" || value.trim().length === 0) {
      continue;
    }

    if (!encryptionKey) {
      throw new IntegrationSecretSetupError(
        "Integration secret encryption key is missing. Set INTEGRATION_SECRET_ENCRYPTION_KEY before saving credentials.",
      );
    }

    config[key] = encryptSecretValue(value.trim(), encryptionKey);
  }

  return config;
}
