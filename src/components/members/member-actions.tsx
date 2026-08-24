"use client";

import {
  useActionState,
} from "react";

import {
  changeMemberRoleAction,
  removeMemberAction,
  type MembershipActionState,
} from "@/server/actions/invitation.actions";
import type {
  OrganizationRole,
} from "@/types/domain";

const initialState: MembershipActionState = {
  status: "idle",
};

interface MemberActionsProps {
  organizationSlug: string;
  membershipId: string;
  memberName: string;
  role: OrganizationRole;
}

export function MemberActions({
  organizationSlug,
  membershipId,
  memberName,
  role,
}: MemberActionsProps) {
  const roleAction =
    changeMemberRoleAction.bind(
      null,
      organizationSlug,
      membershipId,
    );

  const removeAction =
    removeMemberAction.bind(
      null,
      organizationSlug,
      membershipId,
    );

  const [
    roleState,
    roleFormAction,
    rolePending,
  ] = useActionState(
    roleAction,
    initialState,
  );

  const [
    removeState,
    removeFormAction,
    removePending,
  ] = useActionState(
    removeAction,
    initialState,
  );

  if (role === "OWNER") {
    return (
      <span className="text-xs text-neutral-500">
        Owner
      </span>
    );
  }

  return (
    <div className="space-y-2">
      <form
        action={roleFormAction}
        className="flex justify-end gap-2"
      >
        <select
          name="role"
          defaultValue={role}
          disabled={
            rolePending
          }
          className="rounded-md border bg-white px-2 py-1 text-sm"
        >
          <option value="MEMBER">
            Member
          </option>

          <option value="ADMIN">
            Admin
          </option>
        </select>

        <button
          type="submit"
          disabled={rolePending}
          className="rounded-md border px-3 py-1 text-sm"
        >
          {rolePending
            ? "Saving..."
            : "Save"}
        </button>
      </form>

      {roleState.message ? (
        <p className="text-right text-xs text-neutral-500">
          {roleState.message}
        </p>
      ) : null}

      <form
        action={removeFormAction}
        onSubmit={(event) => {
          if (
            !window.confirm(
              `Remove "${memberName}" from this organization?`,
            )
          ) {
            event.preventDefault();
          }
        }}
        className="text-right"
      >
        <button
          type="submit"
          disabled={removePending}
          className="text-xs font-medium text-red-600"
        >
          {removePending
            ? "Removing..."
            : "Remove member"}
        </button>
      </form>

      {removeState.message ? (
        <p className="max-w-xs text-right text-xs text-neutral-500">
          {removeState.message}
        </p>
      ) : null}
    </div>
  );
}