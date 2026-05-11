import { getPool } from "@workspace/db";
import createApp from "./app.js";
import { loadApiServerConfig } from "./config.js";
import { logger } from "./lib/logger.js";

const WORKSPACE_TABLES = [
  "projects",
  "sessions",
  "workflow_artifacts",
  "settings",
  "export_packages",
  "export_items",
  "integration_config",
];

async function ensureWorkspaceSchema(): Promise<void> {
  const pool = getPool();

  for (const tableName of WORKSPACE_TABLES) {
    await pool.query(
      `ALTER TABLE "${tableName}" ADD COLUMN IF NOT EXISTS "workspace_id" text`,
    );
  }
}

export async function createApiServer(): Promise<ReturnType<typeof createApp>> {
  const config = loadApiServerConfig();
  return createApp(config);
}

export async function startApiServer(): Promise<void> {
  const config = loadApiServerConfig();
  await ensureWorkspaceSchema();
  const app = createApp(config);

  app.listen(config.port, (err?: Error) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port: config.port }, "Server listening");
  });
}
