import "server-only";

import type {
  PoolClient,
  QueryResultRow,
} from "pg";

import { query } from "@/lib/db/query";
import type {
  AuditFilters,
} from "@/lib/validation/audit";

/* -------------------------------------------------------------------------- */
/*                                 Write model                                */
/* -------------------------------------------------------------------------- */

export interface AuditLogInput {
  organizationId: string;

  actorUserId:
    | string
    | null;

  action: string;

  entityType?: string;

  entityId?: string;

  metadata?: Record<
    string,
    unknown
  >;
}

/* -------------------------------------------------------------------------- */
/*                                  Read model                                */
/* -------------------------------------------------------------------------- */

export interface AuditLogEntry {
  id: string;

  organizationId: string;

  actorUserId:
    | string
    | null;

  actorName:
    | string
    | null;

  actorEmail:
    | string
    | null;

  action: string;

  entityType:
    | string
    | null;

  entityId:
    | string
    | null;

  metadata: Record<
    string,
    unknown
  >;

  createdAt: Date;
}

interface AuditLogRow
  extends QueryResultRow,
    AuditLogEntry {}

/* -------------------------------------------------------------------------- */
/*                                 Insert log                                 */
/* -------------------------------------------------------------------------- */

export async function insertAuditLog(
  client: PoolClient,
  input: AuditLogInput,
): Promise<void> {
  await client.query(
    `INSERT INTO audit_logs (
       organization_id,
       actor_user_id,
       action,
       entity_type,
       entity_id,
       metadata
     )
     VALUES (
       $1,
       $2,
       $3,
       $4,
       $5,
       $6::jsonb
     )`,
    [
      input.organizationId,

      input.actorUserId,

      input.action,

      input.entityType ??
        null,

      input.entityId ??
        null,

      JSON.stringify(
        input.metadata ?? {},
      ),
    ],
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Read logs                                 */
/* -------------------------------------------------------------------------- */

export async function listAuditLogs(
  organizationId: string,
  filters: AuditFilters = {},
  limit = 100,
): Promise<AuditLogEntry[]> {
  const conditions: string[] = [
    "a.organization_id = $1",
  ];

  const values: unknown[] = [
    organizationId,
  ];

  if (filters.action) {
    values.push(
      filters.action,
    );

    conditions.push(
      `a.action = $${values.length}`,
    );
  }

  if (filters.entityType) {
    values.push(
      filters.entityType,
    );

    conditions.push(
      `a.entity_type = $${values.length}`,
    );
  }

  /*
   * Protect the repository from accidentally
   * requesting an unreasonable number of rows.
   */
  const safeLimit =
    Math.min(
      Math.max(
        limit,
        1,
      ),
      250,
    );

  values.push(
    safeLimit,
  );

  const limitParameter =
    `$${values.length}`;

  const result =
    await query<AuditLogRow>(
      `SELECT
         a.id,

         a.organization_id AS "organizationId",

         a.actor_user_id AS "actorUserId",

         u.name AS "actorName",

         u.email AS "actorEmail",

         a.action,

         a.entity_type AS "entityType",

         a.entity_id AS "entityId",

         a.metadata,

         a.created_at AS "createdAt"

       FROM audit_logs AS a

       LEFT JOIN users AS u
         ON u.id =
            a.actor_user_id

       WHERE ${conditions.join(
         "\n AND ",
       )}

       ORDER BY
         a.created_at DESC,
         a.id DESC

       LIMIT ${limitParameter}`,
      values,
    );

  return result.rows;
}