"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import type {
  OrganizationRole,
  OrganizationSummary,
} from "@/types/domain";

interface OrganizationSwitcherProps {
  organizations: OrganizationSummary[];
  currentOrganizationSlug: string;
}

function formatRole(
  role: OrganizationRole,
): string {
  switch (role) {
    case "OWNER":
      return "Owner";

    case "ADMIN":
      return "Admin";

    case "MEMBER":
      return "Member";
  }
}

export function OrganizationSwitcher({
  organizations,
  currentOrganizationSlug,
}: OrganizationSwitcherProps) {
  const router = useRouter();

  const [pending, startTransition] =
    useTransition();

  function handleOrganizationChange(
    event: React.ChangeEvent<HTMLSelectElement>,
  ) {
    const slug = event.target.value;

    if (
      !slug ||
      slug === currentOrganizationSlug
    ) {
      return;
    }

    startTransition(() => {
      router.push(`/${slug}`);
    });
  }

  return (
    <div className="space-y-1">
      <label
        htmlFor="organization-switcher"
        className="block text-xs font-medium uppercase tracking-wide text-neutral-500"
      >
        Organization
      </label>

      <select
        id="organization-switcher"
        value={currentOrganizationSlug}
        disabled={pending}
        onChange={
          handleOrganizationChange
        }
        className="w-full rounded-md border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black disabled:cursor-wait disabled:opacity-60"
      >
        {organizations.map(
          (organization) => (
            <option
              key={organization.id}
              value={organization.slug}
            >
              {organization.name} ·{" "}
              {formatRole(
                organization.role,
              )}
            </option>
          ),
        )}
      </select>
    </div>
  );
}