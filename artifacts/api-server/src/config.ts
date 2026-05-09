import path from "node:path";
import { config as loadEnv } from "dotenv";

const ROOT_ENV_PATH = path.resolve(process.cwd(), "../../.env");
const DEFAULT_APP_ORIGINS = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
];

export type ApiServerConfig = {
  clerkSecretKey: string;
  clerkPublishableKey: string;
  clerkClockSkewInMs: number;
  appOrigins: string[];
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

function normalizeOrigin(value: string): string {
  try {
    return new URL(value).origin;
  } catch {
    throw new Error(`Invalid app origin: "${value}"`);
  }
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
    ...DEFAULT_APP_ORIGINS.map(normalizeOrigin),
  ]);

  return [...merged];
}

export function loadApiServerConfig(): ApiServerConfig {
  loadEnv({ path: ROOT_ENV_PATH });

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
  const appOrigin = readRequiredEnv("VITE_APP_URL");
  const rawClockSkewInMs = process.env.CLERK_CLOCK_SKEW_IN_MS?.trim() ?? "15000";
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
    databaseUrl,
    integrationSecretEncryptionKey:
      process.env.INTEGRATION_SECRET_ENCRYPTION_KEY?.trim() ?? null,
    port,
  };
}
