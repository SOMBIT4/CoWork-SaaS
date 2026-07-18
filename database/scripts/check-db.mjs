import process from "node:process";

import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error(
    "DATABASE_URL is missing. Check your .env.local file.",
  );
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  max: 1,
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 5_000,
  allowExitOnIdle: true,
  application_name: "coworking-saas-db-check",
});

async function checkDatabase() {
  try {
    const result = await pool.query(`
      SELECT
        current_database() AS "databaseName",
        current_user AS "databaseUser",
        NOW() AS "serverTime",
        version() AS "postgresVersion"
    `);

    const connection = result.rows[0];

    console.log("PostgreSQL connection successful");
    console.log("--------------------------------");
    console.log(`Database: ${connection.databaseName}`);
    console.log(`User: ${connection.databaseUser}`);
    console.log(`Server time: ${connection.serverTime}`);
    console.log(`Version: ${connection.postgresVersion}`);
  } catch (error) {
    console.error("PostgreSQL connection failed");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

await checkDatabase();