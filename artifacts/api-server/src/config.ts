import path from "node:path";
import { config as loadEnv } from "dotenv";

const ENV_PATHS = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../../.env"),
];
const DEFAULT_APP_ORIGINS = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
];

export type ApiServerConfig = {
  clerkSecretKey: string;
  clerkPublishableKey: string;
  clerkClockSkewInMs: number;
  appOrigins: string[];
  enforceAuthorizedParties: boolean;
  databaseUrl: string;
  integrationSecretEncryptionKey: string | null;
  port: number;
};

function readRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required server env: ${name}`);
  }

  return value;
}

function loadLocalEnv(): void {
  for (const envPath of ENV_PATHS) {
    loadEnv({ path: envPath });
  }
}

function readAppOrigin(): string {
  const configured = process.env.VITE_APP_URL?.trim();
  if (configured) {
    return configured;
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }

  throw new Error("Missing required server env: VITE_APP_URL");
}

function normalizeOrigin(value: string): string {
  try {
    return new URL(value).origin;
  } catch {
    throw new Error(`Invalid app origin: "${value}"`);
  }
}

function readVercelOrigins(): string[] {
  return [
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))
    .map((value) => normalizeOrigin(value.startsWith("http") ? value : `https://${value}`));
}

function parseAllowedOrigins(appOrigin: string): string[] {
  const configured = process.env.APP_ALLOWED_ORIGINS
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map(normalizeOrigin) ?? [];

  const merged = new Set<string>([
    normalizeOrigin(appOrigin),
    ...configured,
    ...readVercelOrigins(),
    ...DEFAULT_APP_ORIGINS.map(normalizeOrigin),
  ]);

  return [...merged];
}

export function loadApiServerConfig(): ApiServerConfig {
  loadLocalEnv();

  const clerkPublishableKey =
    process.env.CLERK_PUBLISHABLE_KEY?.trim() ??
    process.env.VITE_CLERK_PUBLISHABLE_KEY?.trim();
  if (!clerkPublishableKey) {
    throw new Error(
      "Missing required server env: CLERK_PUBLISHABLE_KEY or VITE_CLERK_PUBLISHABLE_KEY",
    );
  }

  process.env.CLERK_PUBLISHABLE_KEY = clerkPublishableKey;

  const clerkSecretKey = readRequiredEnv("CLERK_SECRET_KEY");
  const databaseUrl = readRequiredEnv("DATABASE_URL");
  const appOrigin = readAppOrigin();
  const hasConfiguredAllowedOrigins = Boolean(
    process.env.APP_ALLOWED_ORIGINS?.trim(),
  );
  const rawClockSkewInMs = process.env.CLERK_CLOCK_SKEW_IN_MS?.trim() ?? "60000";
  const clerkClockSkewInMs = Number(rawClockSkewInMs);

  if (Number.isNaN(clerkClockSkewInMs) || clerkClockSkewInMs < 0) {
    throw new Error(`Invalid CLERK_CLOCK_SKEW_IN_MS value: "${rawClockSkewInMs}"`);
  }

  const rawPort = process.env.PORT?.trim() ?? "24549";
  const port = Number(rawPort);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }

  return {
    clerkSecretKey,
    clerkPublishableKey,
    clerkClockSkewInMs,
    appOrigins: parseAllowedOrigins(appOrigin),
    enforceAuthorizedParties: hasConfiguredAllowedOrigins,
    databaseUrl,
    integrationSecretEncryptionKey:
      process.env.INTEGRATION_SECRET_ENCRYPTION_KEY?.trim() ?? null,
    port,
  };
}
