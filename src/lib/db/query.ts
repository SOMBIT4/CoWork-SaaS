import "server-only";

import type { QueryResult, QueryResultRow } from "pg";
import { pool } from "@/lib/db/pool";

export async function query<T extends QueryResultRow>(
  text: string,
  values: readonly unknown[] = [],
): Promise<QueryResult<T>> {
  return pool.query<T>(text, [...values]);
}