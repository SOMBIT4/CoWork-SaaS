"use server";

import {
  revalidatePath,
} from "next/cache";
import {
  redirect,
} from "next/navigation";
import {
  sendInvitationEmail,
} from "@/lib/email/notifications";
import { env } from "@/lib/env";
import {
  changeMemberRoleSchema,
  inviteMemberSchema,
  invitationTokenSchema,
  membershipIdSchema,
} from "@/lib/validation/invitation";
import {
  requireAuthenticatedUserId,
  requireOrganizationPermission,
} from "@/server/authz/org-context";
import {
  acceptOrganizationInvitation,
  changeOrganizationMemberRole,
  createOrganizationInvitation,
  FinalOwnerRemovalError,
  InvitationAlreadyMemberError,
  InvitationAlreadyPendingError,
  InvitationEmailMismatchError,
  InvitationExpiredError,
  InvitationInvalidError,
  MembershipHasHistoryError,
  MembershipNotFoundError,
  MembershipRoleChangeForbiddenError,
  removeOrganizationMember,
} from "@/server/services/invitation.service";

export interface InvitationActionState {
  status:
    | "idle"
    | "success"
    | "error";

  message?: string;

  inviteUrl?: string;

  fieldErrors?: {
    email?: string[];
    role?: string[];
  };
}

export interface MembershipActionState {
  status:
    | "idle"
    | "success"
    | "error";

  message?: string;
}

export async function createInvitationAction(
  orgSlug: string,
  previousState: InvitationActionState,
  formData: FormData,
): Promise<InvitationActionState> {
  void previousState;

  const context =
    await requireOrganizationPermission(
      orgSlug,
      "MANAGE_MEMBERS",
    );

  const parsed =
    inviteMemberSchema.safeParse({
      email:
        formData.get("email"),

      role:
        formData.get("role"),
    });

  if (!parsed.success) {
    return {
      status: "error",

      message:
        "Please correct the invitation details.",

      fieldErrors:
        parsed.error.flatten()
          .fieldErrors,
    };
  }

  try {
   const result =
  await createOrganizationInvitation(
    context,
    parsed.data,
  );

/*
 * The database transaction inside
 * createOrganizationInvitation()
 * has already committed at this point.
 *
 * Only now do we call the external
 * email provider.
 */
const inviteUrl =
  new URL(
    `/invite/${result.rawToken}`,
    env.APP_URL,
  ).toString();

const delivery =
  await sendInvitationEmail({
    to:
      parsed.data.email,

    organizationName:
      context.organizationName,

    role:
      parsed.data.role,

    invitationUrl:
      inviteUrl,

    expiresInHours:
      48,
  });

revalidatePath(
  `/${context.organizationSlug}/members`,
);

return {
  status: "success",

  message:
    delivery.delivered
      ? "Invitation created and email sent successfully."
      : "Invitation created. Email delivery is unavailable, but the invitation remains valid.",

  /*
   * Never expose the raw invitation link
   * through production UI.
   *
   * This is development-only convenience.
   */
  inviteUrl:
    env.NODE_ENV ===
    "development"
      ? inviteUrl
      : undefined,
};

    revalidatePath(
      `/${context.organizationSlug}/members`,
    );

    /*
     * Section 23/25 will send this URL
     * through Resend.
     *
     * For now the inviter can copy it
     * directly for development testing.
     */
    return {
      status: "success",

      message:
        "Invitation created successfully.",

      inviteUrl,
    };
  } catch (error) {
    if (
      error instanceof
      InvitationAlreadyMemberError
    ) {
      return {
        status: "error",
        message:
          "That user is already an organization member.",
      };
    }

    if (
      error instanceof
      InvitationAlreadyPendingError
    ) {
      return {
        status: "error",
        message:
          "An active invitation already exists for that email.",
      };
    }

    throw error;
  }
}

export async function acceptInvitationAction(
  rawToken: string,
  previousState: MembershipActionState,
  formData: FormData,
): Promise<MembershipActionState> {
  void previousState;
  void formData;

  const parsed =
    invitationTokenSchema.safeParse(
      rawToken,
    );

  if (!parsed.success) {
    return {
      status: "error",
      message:
        "This invitation link is invalid.",
    };
  }

  const userId =
    await requireAuthenticatedUserId();

  let organizationSlug: string;

  try {
    const result =
      await acceptOrganizationInvitation(
        parsed.data,
        userId,
      );

    organizationSlug =
      result.organizationSlug;
  } catch (error) {
    if (
      error instanceof
      InvitationExpiredError
    ) {
      return {
        status: "error",
        message:
          "This invitation has expired.",
      };
    }

    if (
      error instanceof
      InvitationEmailMismatchError
    ) {
      return {
        status: "error",
        message:
          "You are signed in with a different email address from the invitation.",
      };
    }

    if (
      error instanceof
      InvitationInvalidError
    ) {
      return {
        status: "error",
        message:
          "This invitation is invalid or has already been used.",
      };
    }

    throw error;
  }

  revalidatePath(
    `/${organizationSlug}`,
  );

  redirect(
    `/${organizationSlug}`,
  );
}

export async function changeMemberRoleAction(
  orgSlug: string,
  membershipId: string,
  previousState: MembershipActionState,
  formData: FormData,
): Promise<MembershipActionState> {
  void previousState;

  const context =
    await requireOrganizationPermission(
      orgSlug,
      "MANAGE_MEMBERS",
    );

  const parsedId =
    membershipIdSchema.safeParse(
      membershipId,
    );

  const parsedRole =
    changeMemberRoleSchema.safeParse({
      role:
        formData.get("role"),
    });

  if (
    !parsedId.success ||
    !parsedRole.success
  ) {
    return {
      status: "error",
      message:
        "Invalid member or role.",
    };
  }

  try {
    await changeOrganizationMemberRole(
      context,
      parsedId.data,
      parsedRole.data,
    );
  } catch (error) {
    if (
      error instanceof
        MembershipNotFoundError ||
      error instanceof
        MembershipRoleChangeForbiddenError
    ) {
      return {
        status: "error",
        message:
          error.message,
      };
    }

    throw error;
  }

  revalidatePath(
    `/${context.organizationSlug}/members`,
  );

  return {
    status: "success",
    message:
      "Member role updated.",
  };
}

export async function removeMemberAction(
  orgSlug: string,
  membershipId: string,
  previousState: MembershipActionState,
  formData: FormData,
): Promise<MembershipActionState> {
  void previousState;
  void formData;

  const context =
    await requireOrganizationPermission(
      orgSlug,
      "MANAGE_MEMBERS",
    );

  const parsedId =
    membershipIdSchema.safeParse(
      membershipId,
    );

  if (!parsedId.success) {
    return {
      status: "error",
      message:
        "Invalid organization member.",
    };
  }

  try {
    await removeOrganizationMember(
      context,
      parsedId.data,
    );
  } catch (error) {
    if (
      error instanceof
      FinalOwnerRemovalError
    ) {
      return {
        status: "error",
        message:
          "The final organization owner cannot be removed.",
      };
    }

    if (
      error instanceof
      MembershipHasHistoryError
    ) {
      return {
        status: "error",
        message:
          "This member has booking history and cannot be hard-deleted with the current database model.",
      };
    }

    if (
      error instanceof
        MembershipNotFoundError ||
      error instanceof
        MembershipRoleChangeForbiddenError
    ) {
      return {
        status: "error",
        message:
          error.message,
      };
    }

    throw error;
  }

  revalidatePath(
    `/${context.organizationSlug}/members`,
  );

  return {
    status: "success",
    message:
      "Member removed.",
  };
}