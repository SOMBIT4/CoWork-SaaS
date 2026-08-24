"use client";

import {
  useActionState,
} from "react";

import {
  acceptInvitationAction,
  type MembershipActionState,
} from "@/server/actions/invitation.actions";

const initialState: MembershipActionState = {
  status: "idle",
};

interface AcceptInvitationFormProps {
  token: string;
}

export function AcceptInvitationForm({
  token,
}: AcceptInvitationFormProps) {
  const action =
    acceptInvitationAction.bind(
      null,
      token,
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
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-black px-4 py-2 font-medium text-white disabled:opacity-50"
      >
        {pending
          ? "Joining organization..."
          : "Accept invitation"}
      </button>
    </form>
  );
}