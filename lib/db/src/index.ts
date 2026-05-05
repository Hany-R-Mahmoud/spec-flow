import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;
let pool: pg.Pool | null = null;
let dbInstance: NodePgDatabase<typeof schema> | null = null;

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

export * from "./schema";
