import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error(
    "DATABASE_URL is required. Check your environment configuration.",
  );
  process.exitCode = 1;
  throw new Error("DATABASE_URL is missing");
}

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);

const migrationsDirectory = path.resolve(
  currentDirectory,
  "../migrations",
);

const pool = new Pool({
  connectionString: databaseUrl,
  max: 1,
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 5_000,
  allowExitOnIdle: true,
  application_name: "coworking-saas-migrator",
});

/*
 * PostgreSQL supports application-level advisory locks.
 * These two fixed integers identify this project's migration lock.
 */
const MIGRATION_LOCK_NAMESPACE = 28_071;
const MIGRATION_LOCK_ID = 1;

function calculateChecksum(sql) {
  return createHash("sha256").update(sql, "utf8").digest("hex");
}

async function getMigrationFiles() {
  await fs.mkdir(migrationsDirectory, {
    recursive: true,
  });

  const entries = await fs.readdir(migrationsDirectory, {
    withFileTypes: true,
  });

  return entries
    .filter(
      (entry) =>
        entry.isFile() &&
        /^\d{4}_[a-z0-9_]+\.sql$/i.test(entry.name),
    )
    .map((entry) => entry.name)
    .sort((first, second) =>
      first.localeCompare(second, "en"),
    );
}

async function migrate() {
  const client = await pool.connect();
  let lockAcquired = false;
  let destroyClient = false;

  try {
    /*
     * Only one application instance may run migrations at a time.
     */
    await client.query(
      "SELECT pg_advisory_lock($1, $2)",
      [MIGRATION_LOCK_NAMESPACE, MIGRATION_LOCK_ID],
    );

    lockAcquired = true;

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        checksum TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const files = await getMigrationFiles();

    if (files.length === 0) {
      console.log("No SQL migration files were found.");
      console.log(
        `Migration directory: ${migrationsDirectory}`,
      );
      return;
    }

    const appliedResult = await client.query(`
      SELECT version, checksum
      FROM schema_migrations
      ORDER BY version ASC
    `);

    const appliedMigrations = new Map(
      appliedResult.rows.map((row) => [
        row.version,
        row.checksum,
      ]),
    );

    let appliedCount = 0;

    for (const file of files) {
      const filePath = path.join(
        migrationsDirectory,
        file,
      );

      const sql = await fs.readFile(filePath, "utf8");
      const checksum = calculateChecksum(sql);
      const storedChecksum = appliedMigrations.get(file);

      if (storedChecksum) {
        if (storedChecksum !== checksum) {
          throw new Error(
            [
              `Applied migration "${file}" was modified.`,
              "Never edit an applied migration.",
              "Restore the original file or add a new migration.",
            ].join(" "),
          );
        }

        console.log(`Already applied: ${file}`);
        continue;
      }

      console.log(`Applying migration: ${file}`);

      await client.query("BEGIN");

      try {
        await client.query(sql);

        await client.query(
          `INSERT INTO schema_migrations (
             version,
             checksum
           )
           VALUES ($1, $2)`,
          [file, checksum],
        );

        await client.query("COMMIT");
        appliedCount += 1;

        console.log(`Applied successfully: ${file}`);
      } catch (error) {
        try {
          await client.query("ROLLBACK");
        } catch (rollbackError) {
          destroyClient = true;

          console.error(
            `Rollback failed for migration "${file}":`,
            rollbackError,
          );
        }

        throw error;
      }
    }

    if (appliedCount === 0) {
      console.log("Database schema is already up to date.");
    } else {
      console.log(
        `${appliedCount} migration(s) applied successfully.`,
      );
    }
  } finally {
    if (lockAcquired && !destroyClient) {
      try {
        await client.query(
          "SELECT pg_advisory_unlock($1, $2)",
          [
            MIGRATION_LOCK_NAMESPACE,
            MIGRATION_LOCK_ID,
          ],
        );
      } catch (unlockError) {
        destroyClient = true;

        console.error(
          "Failed to release the migration lock:",
          unlockError,
        );
      }
    }

    client.release(destroyClient);
    await pool.end();
  }
}

migrate().catch((error) => {
  console.error("Database migration failed.");

  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }

  process.exitCode = 1;
});