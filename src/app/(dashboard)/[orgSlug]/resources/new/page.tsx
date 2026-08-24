import {
  ResourceForm,
} from "@/components/resources/resource-form";
import {
  requireOrganizationPermission,
} from "@/server/authz/org-context";

interface NewResourcePageProps {
  params: Promise<{
    orgSlug: string;
  }>;
}

export default async function NewResourcePage({
  params,
}: NewResourcePageProps) {
  const { orgSlug } =
    await params;

  const context =
    await requireOrganizationPermission(
      orgSlug,
      "MANAGE_RESOURCES",
    );

  return (
    <section className="max-w-2xl">
      <p className="text-sm font-medium text-neutral-500">
        Resources
      </p>

      <h2 className="mt-2 text-3xl font-semibold">
        Create resource
      </h2>

      <p className="mt-2 text-neutral-600">
        Add a desk, room or cabin
        to{" "}
        {
          context.organizationName
        }.
      </p>

      <div className="mt-8 rounded-xl border bg-white p-6">
        <ResourceForm
          organizationSlug={
            context.organizationSlug
          }
        />
      </div>
    </section>
  );
}