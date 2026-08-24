import { requireOrganizationPermission } from "@/server/authz/org-context";

interface SettingsPageProps {
  params: Promise<{
    orgSlug: string;
  }>;
}

export default async function SettingsPage({
  params,
}: SettingsPageProps) {
  const { orgSlug } =
    await params;

  const context =
    await requireOrganizationPermission(
      orgSlug,
      "MANAGE_ORGANIZATION",
    );

  return (
    <section>
      <h2 className="text-3xl font-semibold">
        Organization settings
      </h2>

      <p className="mt-2 text-neutral-600">
        Owner-only settings for{" "}
        {context.organizationName}.
      </p>

      <dl className="mt-8 max-w-2xl divide-y rounded-xl border bg-white">
        <div className="p-5">
          <dt className="text-sm text-neutral-500">
            Organization
          </dt>

          <dd className="mt-1 font-medium">
            {
              context.organizationName
            }
          </dd>
        </div>

        <div className="p-5">
          <dt className="text-sm text-neutral-500">
            URL
          </dt>

          <dd className="mt-1 font-medium">
            /
            {
              context.organizationSlug
            }
          </dd>
        </div>

        <div className="p-5">
          <dt className="text-sm text-neutral-500">
            Timezone
          </dt>

          <dd className="mt-1 font-medium">
            {
              context.organizationTimezone
            }
          </dd>
        </div>

        <div className="p-5">
          <dt className="text-sm text-neutral-500">
            Plan
          </dt>

          <dd className="mt-1 font-medium">
            {
              context.organizationPlan
            }
          </dd>
        </div>
      </dl>
    </section>
  );
}