import "server-only";

import type {
  PoolClient,
  QueryResultRow,
} from "pg";

import { query } from "@/lib/db/query";
import type {
  OrganizationRole,
} from "@/types/domain";

export interface OrganizationMember {
  membershipId: string;
  userId: string;
  name: string;
  email: string;
  role: OrganizationRole;
  createdAt: Date;
}

export interface PendingInvitation {
  id: string;
  email: string;
  role: OrganizationRole;
  expiresAt: Date;
  createdAt: Date;
}

export interface InvitationPreview {
  id: string;
  organizationName: string;
  organizationSlug: string;
  role: OrganizationRole;
  expiresAt: Date;
}

export interface InvitationRecord {
  id: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  email: string;
  role: OrganizationRole;
  tokenHash: string;
  invitedByUserId: string;
  expiresAt: Date;
  acceptedAt: Date | null;
  acceptedByUserId: string | null;
}

export interface MembershipRecord {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  name: string;
  email: string;
}

interface MemberRow
  extends QueryResultRow,
    OrganizationMember {}

interface PendingInvitationRow
  extends QueryResultRow,
    PendingInvitation {}

interface InvitationPreviewRow
  extends QueryResultRow,
    InvitationPreview {}

interface InvitationRecordRow
  extends QueryResultRow,
    InvitationRecord {}

interface MembershipRecordRow
  extends QueryResultRow,
    MembershipRecord {}

interface IdRow
  extends QueryResultRow {
  id: string;
}

interface OwnerRow
  extends QueryResultRow {
  id: string;
  userId: string;
}

interface UserIdentityRow
  extends QueryResultRow {
  id: string;
  email: string;
  name: string;
}

export async function listOrganizationMembers(
  organizationId: string,
): Promise<OrganizationMember[]> {
  const result =
    await query<MemberRow>(
      `SELECT
         m.id AS "membershipId",
         u.id AS "userId",
         u.name,
         u.email,
         m.role,
         m.created_at AS "createdAt"
       FROM memberships AS m
       INNER JOIN users AS u
         ON u.id = m.user_id
       WHERE m.organization_id = $1
       ORDER BY
         CASE m.role
           WHEN 'OWNER' THEN 1
           WHEN 'ADMIN' THEN 2
           ELSE 3
         END,
         u.name ASC`,
      [organizationId],
    );

  return result.rows;
}

export async function listPendingInvitations(
  organizationId: string,
): Promise<PendingInvitation[]> {
  const result =
    await query<PendingInvitationRow>(
      `SELECT
         id,
         email,
         role,
         expires_at AS "expiresAt",
         created_at AS "createdAt"
       FROM organization_invitations
       WHERE organization_id = $1
         AND accepted_at IS NULL
         AND expires_at > NOW()
       ORDER BY created_at DESC`,
      [organizationId],
    );

  return result.rows;
}

export async function findExistingMemberByEmail(
  client: PoolClient,
  organizationId: string,
  email: string,
): Promise<MembershipRecord | null> {
  const result =
    await client.query<MembershipRecordRow>(
      `SELECT
         m.id,
         m.organization_id AS "organizationId",
         m.user_id AS "userId",
         m.role,
         u.name,
         u.email
       FROM memberships AS m
       INNER JOIN users AS u
         ON u.id = m.user_id
       WHERE m.organization_id = $1
         AND u.email = $2
       LIMIT 1`,
      [
        organizationId,
        email,
      ],
    );

  return result.rows[0] ?? null;
}

export async function findPendingInvitationByEmail(
  client: PoolClient,
  organizationId: string,
  email: string,
): Promise<IdRow | null> {
  const result =
    await client.query<IdRow>(
      `SELECT id
       FROM organization_invitations
       WHERE organization_id = $1
         AND email = $2
         AND accepted_at IS NULL
         AND expires_at > NOW()
       LIMIT 1`,
      [
        organizationId,
        email,
      ],
    );

  return result.rows[0] ?? null;
}

export async function insertInvitation(
  client: PoolClient,
  input: {
    organizationId: string;
    email: string;
    role: "ADMIN" | "MEMBER";
    tokenHash: string;
    invitedByUserId: string;
    expiresAt: Date;
  },
): Promise<{
  id: string;
  email: string;
  role: OrganizationRole;
  expiresAt: Date;
}> {
  const result =
    await client.query<
      QueryResultRow & {
        id: string;
        email: string;
        role: OrganizationRole;
        expiresAt: Date;
      }
    >(
      `INSERT INTO organization_invitations (
         organization_id,
         email,
         role,
         token_hash,
         invited_by_user_id,
         expires_at
       )
       VALUES (
         $1,
         $2,
         $3,
         $4,
         $5,
         $6
       )
       RETURNING
         id,
         email,
         role,
         expires_at AS "expiresAt"`,
      [
        input.organizationId,
        input.email,
        input.role,
        input.tokenHash,
        input.invitedByUserId,
        input.expiresAt,
      ],
    );

  const invitation =
    result.rows[0];

  if (!invitation) {
    throw new Error(
      "Invitation insertion returned no invitation.",
    );
  }

  return invitation;
}

export async function findUsableInvitationPreview(
  tokenHash: string,
): Promise<InvitationPreview | null> {
  const result =
    await query<InvitationPreviewRow>(
      `SELECT
         i.id,
         o.name AS "organizationName",
         o.slug AS "organizationSlug",
         i.role,
         i.expires_at AS "expiresAt"
       FROM organization_invitations AS i
       INNER JOIN organizations AS o
         ON o.id = i.organization_id
       WHERE i.token_hash = $1
         AND i.accepted_at IS NULL
         AND i.expires_at > NOW()
       LIMIT 1`,
      [tokenHash],
    );

  return result.rows[0] ?? null;
}

export async function getInvitationForUpdate(
  client: PoolClient,
  tokenHash: string,
): Promise<InvitationRecord | null> {
  const result =
    await client.query<InvitationRecordRow>(
      `SELECT
         i.id,
         i.organization_id AS "organizationId",
         o.name AS "organizationName",
         o.slug AS "organizationSlug",
         i.email,
         i.role,
         i.token_hash AS "tokenHash",
         i.invited_by_user_id AS "invitedByUserId",
         i.expires_at AS "expiresAt",
         i.accepted_at AS "acceptedAt",
         i.accepted_by_user_id AS "acceptedByUserId"
       FROM organization_invitations AS i
       INNER JOIN organizations AS o
         ON o.id = i.organization_id
       WHERE i.token_hash = $1
       LIMIT 1
       FOR UPDATE OF i`,
      [tokenHash],
    );

  return result.rows[0] ?? null;
}

export async function findUserIdentityForInvitation(
  client: PoolClient,
  userId: string,
): Promise<{
  id: string;
  email: string;
  name: string;
} | null> {
  const result =
    await client.query<UserIdentityRow>(
      `SELECT
         id,
         email,
         name
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [userId],
    );

  return result.rows[0] ?? null;
}

export async function insertMembershipFromInvitation(
  client: PoolClient,
  input: {
    organizationId: string;
    userId: string;
    role: OrganizationRole;
  },
): Promise<MembershipRecord> {
  const inserted =
    await client.query<MembershipRecordRow>(
      `INSERT INTO memberships (
         organization_id,
         user_id,
         role
       )
       VALUES (
         $1,
         $2,
         $3
       )
       ON CONFLICT (
         organization_id,
         user_id
       )
       DO NOTHING
       RETURNING
         id,
         organization_id AS "organizationId",
         user_id AS "userId",
         role,
         ''::text AS name,
         ''::text AS email`,
      [
        input.organizationId,
        input.userId,
        input.role,
      ],
    );

  const created =
    inserted.rows[0];

  if (created) {
    return created;
  }

  const existing =
    await client.query<MembershipRecordRow>(
      `SELECT
         m.id,
         m.organization_id AS "organizationId",
         m.user_id AS "userId",
         m.role,
         u.name,
         u.email
       FROM memberships AS m
       INNER JOIN users AS u
         ON u.id = m.user_id
       WHERE m.organization_id = $1
         AND m.user_id = $2
       LIMIT 1`,
      [
        input.organizationId,
        input.userId,
      ],
    );

  const membership =
    existing.rows[0];

  if (!membership) {
    throw new Error(
      "Membership creation returned no membership.",
    );
  }

  return membership;
}

export async function markInvitationAccepted(
  client: PoolClient,
  invitationId: string,
  userId: string,
): Promise<boolean> {
  const result =
    await client.query<IdRow>(
      `UPDATE organization_invitations
       SET
         accepted_at = NOW(),
         accepted_by_user_id = $2
       WHERE id = $1
         AND accepted_at IS NULL
       RETURNING id`,
      [
        invitationId,
        userId,
      ],
    );

  return result.rowCount === 1;
}

export async function getMembershipForUpdate(
  client: PoolClient,
  organizationId: string,
  membershipId: string,
): Promise<MembershipRecord | null> {
  const result =
    await client.query<MembershipRecordRow>(
      `SELECT
         m.id,
         m.organization_id AS "organizationId",
         m.user_id AS "userId",
         m.role,
         u.name,
         u.email
       FROM memberships AS m
       INNER JOIN users AS u
         ON u.id = m.user_id
       WHERE m.organization_id = $1
         AND m.id = $2
       LIMIT 1
       FOR UPDATE OF m`,
      [
        organizationId,
        membershipId,
      ],
    );

  return result.rows[0] ?? null;
}

export async function updateMembershipRole(
  client: PoolClient,
  organizationId: string,
  membershipId: string,
  role: "ADMIN" | "MEMBER",
): Promise<boolean> {
  const result =
    await client.query<IdRow>(
      `UPDATE memberships
       SET role = $3
       WHERE organization_id = $1
         AND id = $2
         AND role <> 'OWNER'
       RETURNING id`,
      [
        organizationId,
        membershipId,
        role,
      ],
    );

  return result.rowCount === 1;
}

export async function lockOrganizationOwners(
  client: PoolClient,
  organizationId: string,
): Promise<OwnerRow[]> {
  const result =
    await client.query<OwnerRow>(
      `SELECT
         id,
         user_id AS "userId"
       FROM memberships
       WHERE organization_id = $1
         AND role = 'OWNER'
       FOR UPDATE`,
      [organizationId],
    );

  return result.rows;
}

export async function deleteMembership(
  client: PoolClient,
  organizationId: string,
  membershipId: string,
): Promise<boolean> {
  const result =
    await client.query<IdRow>(
      `DELETE FROM memberships
       WHERE organization_id = $1
         AND id = $2
       RETURNING id`,
      [
        organizationId,
        membershipId,
      ],
    );

  return result.rowCount === 1;
}