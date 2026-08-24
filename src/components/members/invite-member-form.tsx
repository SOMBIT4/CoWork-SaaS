"use client";

import {
  useActionState,
} from "react";

import {
  createInvitationAction,
  type InvitationActionState,
} from "@/server/actions/invitation.actions";

const initialState: InvitationActionState = {
  status: "idle",
};

interface InviteMemberFormProps {
  organizationSlug: string;
}

export function InviteMemberForm({
  organizationSlug,
}: InviteMemberFormProps) {
  const action =
    createInvitationAction.bind(
      null,
      organizationSlug,
    );

  const [
    state,
    formAction,
    pending,
  ] = useActionState(
    action,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="space-y-4"
    >
      {state.message ? (
        <div
          className={
            state.status ===
            "success"
              ? "rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700"
              : "rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          }
        >
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-[1fr_160px_auto]">
        <div>
          <input
            name="email"
            type="email"
            required
            maxLength={320}
            placeholder="member@example.com"
            className="w-full rounded-md border px-3 py-2"
          />

          {state.fieldErrors
            ?.email?.map(
              (error) => (
                <p
                  key={error}
                  className="mt-1 text-sm text-red-600"
                >
                  {error}
                </p>
              ),
            )}
        </div>

        <select
          name="role"
          defaultValue="MEMBER"
          className="rounded-md border bg-white px-3 py-2"
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
          disabled={pending}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending
            ? "Inviting..."
            : "Invite"}
        </button>
      </div>

      {state.inviteUrl ? (
        <div className="rounded-md border bg-neutral-50 p-4">
          <p className="text-xs font-medium text-neutral-500">
            Development invitation link
          </p>

          <p className="mt-2 break-all text-sm">
            {state.inviteUrl}
          </p>

          <p className="mt-2 text-xs text-neutral-500">
            Email delivery will be connected in the next email/notification section.
          </p>
        </div>
      ) : null}
    </form>
  );
}