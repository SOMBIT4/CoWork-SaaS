import "server-only";

import { Pool } from "pg";
import { env } from "@/lib/env";

declare global {
  // Prevent additional pools during Next.js development hot reloads.
  var __coworkPool: Pool | undefined;
}

function createPool(): Pool {
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: process.env.NODE_ENV === "production" ? 10 : 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

  pool.on("error", (error) => {
    console.error("Unexpected idle PostgreSQL client error", error);
  });

  return pool;
}

export const pool = global.__coworkPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  global.__coworkPool = pool;
}