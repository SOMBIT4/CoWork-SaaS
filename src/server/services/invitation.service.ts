import "server-only";

import type {
  DatabaseError,
} from "pg";

import {
  withTransaction,
} from "@/lib/db/transaction";
import type {
  ChangeMemberRoleInput,
  InviteMemberInput,
} from "@/lib/validation/invitation";
import {
  generateInvitationToken,
  hashInvitationToken,
} from "@/lib/security/invitation-token";
import {
  assertOrganizationPermission,
} from "@/server/authz/roles";
import {
  insertAuditLog,
} from "@/server/repositories/audit.repository";
import {
  deleteMembership,
  findExistingMemberByEmail,
  findPendingInvitationByEmail,
  findUserIdentityForInvitation,
  getInvitationForUpdate,
  getMembershipForUpdate,
  insertInvitation,
  insertMembershipFromInvitation,
  lockOrganizationOwners,
  markInvitationAccepted,
  updateMembershipRole,
} from "@/server/repositories/invitation.repository";
import type {
  OrganizationContext,
} from "@/types/domain";

const INVITATION_LIFETIME_MS =
  48 *
  60 *
  60 *
  1000;

export class InvitationAlreadyMemberError extends Error {
  readonly code =
    "INVITATION_ALREADY_MEMBER";

  constructor() {
    super(
      "This user is already a member of the organization.",
    );

    this.name =
      "InvitationAlreadyMemberError";
  }
}

export class InvitationAlreadyPendingError extends Error {
  readonly code =
    "INVITATION_ALREADY_PENDING";

  constructor() {
    super(
      "An active invitation already exists for this email.",
    );

    this.name =
      "InvitationAlreadyPendingError";
  }
}

export class InvitationInvalidError extends Error {
  readonly code =
    "INVITATION_INVALID";

  constructor() {
    super(
      "This invitation is invalid or has already been used.",
    );

    this.name =
      "InvitationInvalidError";
  }
}

export class InvitationExpiredError extends Error {
  readonly code =
    "INVITATION_EXPIRED";

  constructor() {
    super(
      "This invitation has expired.",
    );

    this.name =
      "InvitationExpiredError";
  }
}

export class InvitationEmailMismatchError extends Error {
  readonly code =
    "INVITATION_EMAIL_MISMATCH";

  constructor() {
    super(
      "This invitation belongs to a different email address.",
    );

    this.name =
      "InvitationEmailMismatchError";
  }
}

export class MembershipNotFoundError extends Error {
  readonly code =
    "MEMBERSHIP_NOT_FOUND";

  constructor() {
    super(
      "The organization member could not be found.",
    );

    this.name =
      "MembershipNotFoundError";
  }
}

export class MembershipRoleChangeForbiddenError extends Error {
  readonly code =
    "MEMBERSHIP_ROLE_CHANGE_FORBIDDEN";

  constructor() {
    super(
      "This member's role cannot be changed.",
    );

    this.name =
      "MembershipRoleChangeForbiddenError";
  }
}

export class FinalOwnerRemovalError extends Error {
  readonly code =
    "FINAL_OWNER_REMOVAL_FORBIDDEN";

  constructor() {
    super(
      "The final organization owner cannot be removed.",
    );

    this.name =
      "FinalOwnerRemovalError";
  }
}

export class MembershipHasHistoryError extends Error {
  readonly code =
    "MEMBERSHIP_HAS_HISTORY";

  constructor() {
    super(
      "This member cannot be removed because booking history references the membership.",
    );

    this.name =
      "MembershipHasHistoryError";
  }
}

export async function createOrganizationInvitation(
  context: OrganizationContext,
  input: InviteMemberInput,
) {
  assertOrganizationPermission(
    context.role,
    "MANAGE_MEMBERS",
  );

  const {
    rawToken,
    tokenHash,
  } = generateInvitationToken();

  const expiresAt =
    new Date(
      Date.now() +
        INVITATION_LIFETIME_MS,
    );

  const invitation =
    await withTransaction(
      async (client) => {
        const existingMember =
          await findExistingMemberByEmail(
            client,
            context.organizationId,
            input.email,
          );

        if (existingMember) {
          throw new InvitationAlreadyMemberError();
        }

        const existingInvitation =
          await findPendingInvitationByEmail(
            client,
            context.organizationId,
            input.email,
          );

        if (
          existingInvitation
        ) {
          throw new InvitationAlreadyPendingError();
        }

        const created =
          await insertInvitation(
            client,
            {
              organizationId:
                context.organizationId,

              email:
                input.email,

              role:
                input.role,

              tokenHash,

              invitedByUserId:
                context.userId,

              expiresAt,
            },
          );

        await insertAuditLog(
          client,
          {
            organizationId:
              context.organizationId,

            actorUserId:
              context.userId,

            action:
              "MEMBER_INVITED",

            entityType:
              "invitation",

            entityId:
              created.id,

            metadata: {
              email:
                created.email,

              role:
                created.role,

              expiresAt:
                created.expiresAt.toISOString(),
            },
          },
        );

        return created;
      },
    );

  /*
   * The raw token exists only here
   * so it can be delivered to the
   * invited user.
   *
   * Never store it in PostgreSQL.
   */
  return {
    invitation,
    rawToken,
  };
}

export async function acceptOrganizationInvitation(
  rawToken: string,
  userId: string,
): Promise<{
  organizationSlug: string;
}> {
  const tokenHash =
    hashInvitationToken(
      rawToken,
    );

  return withTransaction(
    async (client) => {
      const invitation =
        await getInvitationForUpdate(
          client,
          tokenHash,
        );

      if (
        !invitation ||
        invitation.acceptedAt
      ) {
        throw new InvitationInvalidError();
      }

      if (
        invitation.expiresAt.getTime() <=
        Date.now()
      ) {
        throw new InvitationExpiredError();
      }

      const user =
        await findUserIdentityForInvitation(
          client,
          userId,
        );

      if (!user) {
        throw new InvitationInvalidError();
      }

      if (
        user.email.toLowerCase() !==
        invitation.email.toLowerCase()
      ) {
        throw new InvitationEmailMismatchError();
      }

      const membership =
        await insertMembershipFromInvitation(
          client,
          {
            organizationId:
              invitation.organizationId,

            userId:
              user.id,

            role:
              invitation.role,
          },
        );

      const accepted =
        await markInvitationAccepted(
          client,
          invitation.id,
          user.id,
        );

      if (!accepted) {
        throw new InvitationInvalidError();
      }

      await insertAuditLog(
        client,
        {
          organizationId:
            invitation.organizationId,

          actorUserId:
            user.id,

          action:
            "INVITATION_ACCEPTED",

          entityType:
            "membership",

          entityId:
            membership.id,

          metadata: {
            role:
              membership.role,
          },
        },
      );

      return {
        organizationSlug:
          invitation.organizationSlug,
      };
    },
  );
}

export async function changeOrganizationMemberRole(
  context: OrganizationContext,
  membershipId: string,
  input: ChangeMemberRoleInput,
): Promise<void> {
  assertOrganizationPermission(
    context.role,
    "MANAGE_MEMBERS",
  );

  await withTransaction(
    async (client) => {
      const membership =
        await getMembershipForUpdate(
          client,
          context.organizationId,
          membershipId,
        );

      if (!membership) {
        throw new MembershipNotFoundError();
      }

      /*
       * OWNER is not managed through
       * the normal ADMIN/MEMBER role
       * selector.
       */
      if (
        membership.role ===
        "OWNER"
      ) {
        throw new MembershipRoleChangeForbiddenError();
      }

      if (
        membership.role ===
        input.role
      ) {
        return;
      }

      const updated =
        await updateMembershipRole(
          client,
          context.organizationId,
          membership.id,
          input.role,
        );

      if (!updated) {
        throw new MembershipNotFoundError();
      }

      await insertAuditLog(
        client,
        {
          organizationId:
            context.organizationId,

          actorUserId:
            context.userId,

          action:
            "MEMBER_ROLE_CHANGED",

          entityType:
            "membership",

          entityId:
            membership.id,

          metadata: {
            userId:
              membership.userId,

            previousRole:
              membership.role,

            newRole:
              input.role,
          },
        },
      );
    },
  );
}

export async function removeOrganizationMember(
  context: OrganizationContext,
  membershipId: string,
): Promise<void> {
  assertOrganizationPermission(
    context.role,
    "MANAGE_MEMBERS",
  );

  try {
    await withTransaction(
      async (client) => {
        const membership =
          await getMembershipForUpdate(
            client,
            context.organizationId,
            membershipId,
          );

        if (!membership) {
          throw new MembershipNotFoundError();
        }

        /*
         * ADMIN must never remove an OWNER.
         */
        if (
          membership.role ===
            "OWNER" &&
          context.role !==
            "OWNER"
        ) {
          throw new MembershipRoleChangeForbiddenError();
        }

        if (
          membership.role ===
          "OWNER"
        ) {
          const owners =
            await lockOrganizationOwners(
              client,
              context.organizationId,
            );

          if (
            owners.length <= 1
          ) {
            throw new FinalOwnerRemovalError();
          }
        }

        const removed =
          await deleteMembership(
            client,
            context.organizationId,
            membership.id,
          );

        if (!removed) {
          throw new MembershipNotFoundError();
        }

        await insertAuditLog(
          client,
          {
            organizationId:
              context.organizationId,

            actorUserId:
              context.userId,

            action:
              "MEMBER_REMOVED",

            entityType:
              "membership",

            entityId:
              membership.id,

            metadata: {
              userId:
                membership.userId,

              email:
                membership.email,

              role:
                membership.role,
            },
          },
        );
      },
    );
  } catch (error) {
    const databaseError =
      error as DatabaseError;

    if (
      databaseError?.code ===
        "23503" &&
      databaseError?.constraint ===
        "bookings_membership_in_same_organization_fk"
    ) {
      throw new MembershipHasHistoryError();
    }

    throw error;
  }
}