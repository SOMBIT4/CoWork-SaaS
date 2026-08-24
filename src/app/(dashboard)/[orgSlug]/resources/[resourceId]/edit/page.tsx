import {
  notFound,
} from "next/navigation";

import {
  ResourceForm,
} from "@/components/resources/resource-form";
import {
  resourceIdSchema,
} from "@/lib/validation/resource";
import {
  requireOrganizationPermission,
} from "@/server/authz/org-context";
import {
  getResourceById,
} from "@/server/repositories/resource.repository";

interface EditResourcePageProps {
  params: Promise<{
    orgSlug: string;
    resourceId: string;
  }>;
}

export default async function EditResourcePage({
  params,
}: EditResourcePageProps) {
  const {
    orgSlug,
    resourceId,
  } = await params;

  const context =
    await requireOrganizationPermission(
      orgSlug,
      "MANAGE_RESOURCES",
    );

  const parsedId =
    resourceIdSchema.safeParse(
      resourceId,
    );

  if (!parsedId.success) {
    notFound();
  }

  const resource =
    await getResourceById(
      context.organizationId,
      parsedId.data,
    );

  if (!resource) {
    notFound();
  }

  return (
    <section className="max-w-2xl">
      <p className="text-sm font-medium text-neutral-500">
        Resources
      </p>

      <h2 className="mt-2 text-3xl font-semibold">
        Edit resource
      </h2>

      <p className="mt-2 text-neutral-600">
        Update{" "}
        <strong>
          {resource.name}
        </strong>
        .
      </p>

      {!resource.isActive ? (
        <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          This resource is currently
          inactive and will not be
          available for new bookings.
        </div>
      ) : null}

      <div className="mt-8 rounded-xl border bg-white p-6">
        <ResourceForm
          organizationSlug={
            context.organizationSlug
          }
          resource={resource}
        />
      </div>
    </section>
  );
}