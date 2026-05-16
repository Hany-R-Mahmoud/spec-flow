import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;
let pool: pg.Pool | null = null;
let dbInstance: NodePgDatabase<typeof schema> | null = null;
let schemaReadyPromise: Promise<void> | null = null;

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getPool(): pg.Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }

  pool ??= new Pool({ connectionString: process.env.DATABASE_URL });
  return pool;
}

export function getDb() {
  dbInstance ??= drizzle(getPool(), { schema });
  return dbInstance;
}

export async function ensureWorkspaceSchema(): Promise<void> {
  schemaReadyPromise ??= (async () => {
    const dbPool = getPool();
    const workspaceTables = [
      "projects",
      "sessions",
      "workflow_artifacts",
      "settings",
      "export_packages",
      "export_items",
      "integration_config",
    ];

    for (const tableName of workspaceTables) {
      await dbPool.query(
        `ALTER TABLE "${tableName}" ADD COLUMN IF NOT EXISTS "workspace_id" text`,
      );
    }

    await dbPool.query(
      `ALTER TABLE "ai_provider_config" ADD COLUMN IF NOT EXISTS "base_url" text NOT NULL DEFAULT 'https://api.openai.com/v1'`,
    );
  })();

  return schemaReadyPromise;
}

export * from "./schema";
