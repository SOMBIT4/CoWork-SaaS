"use client";

import {
  Power,
} from "lucide-react";
import {
  useTransition,
} from "react";

import {
  deactivateResourceAction,
} from "@/server/actions/resource.actions";

interface DeactivateResourceButtonProps {
  organizationSlug: string;
  resourceId: string;
  resourceName: string;
}

export function DeactivateResourceButton({
  organizationSlug,
  resourceId,
  resourceName,
}: DeactivateResourceButtonProps) {
  const [
    pending,
    startTransition,
  ] = useTransition();

  function handleDeactivate() {
    const confirmed =
      window.confirm(
        `Deactivate "${resourceName}"?\n\nIt will no longer be available for new bookings.`,
      );

    if (!confirmed) {
      return;
    }

    const formData =
      new FormData();

    startTransition(
      async () => {
        await deactivateResourceAction(
          organizationSlug,
          resourceId,
          formData,
        );
      },
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={
        handleDeactivate
      }
      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-rose-400 transition-all hover:bg-rose-500/10 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Power
        className="size-3.5"
        strokeWidth={2.5}
      />

      {pending
        ? "Deactivating..."
        : "Deactivate"}
    </button>
  );
}