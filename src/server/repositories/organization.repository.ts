import "server-only";

import type { QueryResultRow } from "pg";

import { query } from "@/lib/db/query";
import type {
  OrganizationContext,
  OrganizationPlan,
  OrganizationRole,
} from "@/types/domain";

interface OrganizationContextRow extends QueryResultRow {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  organizationTimezone: string;
  organizationPlan: OrganizationPlan;

  membershipId: string;
  role: OrganizationRole;
}

interface FindOrganizationContextInput {
  userId: string;
  organizationSlug: string;
}

/*
 * Returns an organization only when the supplied user has
 * a membership in it.
 *
 * This is the core tenant-isolation query.
 */
export async function findOrganizationContextForUser({
  userId,
  organizationSlug,
}: FindOrganizationContextInput): Promise<OrganizationContext | null> {
  const result = await query<OrganizationContextRow>(
    `SELECT
       o.id AS "organizationId",
       o.name AS "organizationName",
       o.slug AS "organizationSlug",
       o.timezone AS "organizationTimezone",
       o.plan AS "organizationPlan",
       m.id AS "membershipId",
       m.role
     FROM organizations AS o
     INNER JOIN memberships AS m
       ON m.organization_id = o.id
     WHERE o.slug = $1
       AND m.user_id = $2
     LIMIT 1`,
    [organizationSlug, userId],
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  return {
    organizationId: row.organizationId,
    organizationName: row.organizationName,
    organizationSlug: row.organizationSlug,
    organizationTimezone: row.organizationTimezone,
    organizationPlan: row.organizationPlan,

    membershipId: row.membershipId,
    role: row.role,

    userId,
  };
}