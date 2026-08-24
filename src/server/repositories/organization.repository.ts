import "server-only";

import type {
  PoolClient,
  QueryResultRow,
} from "pg";

import { query } from "@/lib/db/query";
import type { CreateOrganizationInput } from "@/lib/validation/organization";
import type {
  OrganizationContext,
  OrganizationPlan,
  OrganizationRole,
  OrganizationSummary,
} from "@/types/domain";

interface OrganizationContextRow
  extends QueryResultRow {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  organizationTimezone: string;
  organizationPlan: OrganizationPlan;
  membershipId: string;
  role: OrganizationRole;
}

interface OrganizationSummaryRow
  extends QueryResultRow {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  plan: OrganizationPlan;
  membershipId: string;
  role: OrganizationRole;
}

interface CreatedOrganizationRow
  extends QueryResultRow {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  plan: OrganizationPlan;
}

interface MembershipRow extends QueryResultRow {
  id: string;
  role: OrganizationRole;
}

interface FindOrganizationContextInput {
  userId: string;
  organizationSlug: string;
}

export interface CreatedOrganization {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  plan: OrganizationPlan;
}

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
    organizationTimezone:
      row.organizationTimezone,
    organizationPlan: row.organizationPlan,
    membershipId: row.membershipId,
    role: row.role,
    userId,
  };
}

export async function listOrganizationsForUser(
  userId: string,
): Promise<OrganizationSummary[]> {
  const result =
    await query<OrganizationSummaryRow>(
      `SELECT
         o.id,
         o.name,
         o.slug,
         o.timezone,
         o.plan,
         m.id AS "membershipId",
         m.role
       FROM memberships AS m
       INNER JOIN organizations AS o
         ON o.id = m.organization_id
       WHERE m.user_id = $1
       ORDER BY
         m.created_at ASC,
         o.name ASC`,
      [userId],
    );

  return result.rows;
}

export async function findFirstOrganizationForUser(
  userId: string,
): Promise<OrganizationSummary | null> {
  const result =
    await query<OrganizationSummaryRow>(
      `SELECT
         o.id,
         o.name,
         o.slug,
         o.timezone,
         o.plan,
         m.id AS "membershipId",
         m.role
       FROM memberships AS m
       INNER JOIN organizations AS o
         ON o.id = m.organization_id
       WHERE m.user_id = $1
       ORDER BY m.created_at ASC
       LIMIT 1`,
      [userId],
    );

  return result.rows[0] ?? null;
}

export async function insertOrganization(
  client: PoolClient,
  input: CreateOrganizationInput,
): Promise<CreatedOrganization> {
  const result =
    await client.query<CreatedOrganizationRow>(
      `INSERT INTO organizations (
         name,
         slug,
         timezone
       )
       VALUES ($1, $2, $3)
       RETURNING
         id,
         name,
         slug,
         timezone,
         plan`,
      [
        input.name,
        input.slug,
        input.timezone,
      ],
    );

  const organization = result.rows[0];

  if (!organization) {
    throw new Error(
      "Organization insertion returned no organization.",
    );
  }

  return organization;
}

export async function insertOwnerMembership(
  client: PoolClient,
  organizationId: string,
  userId: string,
): Promise<{
  id: string;
  role: OrganizationRole;
}> {
  const result =
    await client.query<MembershipRow>(
      `INSERT INTO memberships (
         organization_id,
         user_id,
         role
       )
       VALUES ($1, $2, 'OWNER')
       RETURNING
         id,
         role`,
      [
        organizationId,
        userId,
      ],
    );

  const membership = result.rows[0];

  if (!membership) {
    throw new Error(
      "Owner membership insertion returned no membership.",
    );
  }

  return membership;
}