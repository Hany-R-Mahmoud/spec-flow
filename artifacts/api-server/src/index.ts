import { loadApiServerConfig } from "./config";
import { logger } from "./lib/logger";
import { getPool } from "@workspace/db";

const config = loadApiServerConfig();

async function ensureWorkspaceSchema(): Promise<void> {
  const pool = getPool();
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
    await pool.query(
      `ALTER TABLE "${tableName}" ADD COLUMN IF NOT EXISTS "workspace_id" text`,
    );
  }
}

await ensureWorkspaceSchema();
const { default: createApp } = await import("./app");
const app = createApp(config);

app.listen(config.port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port: config.port }, "Server listening");
});
