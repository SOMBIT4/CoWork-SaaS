import {
    AlertTriangle,
    Pencil,
} from "lucide-react";
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
    <section className="max-w-3xl space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg shadow-violet-500/25">
            <Pencil className="size-5 text-white" strokeWidth={2.5} />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
            Edit Resource
          </p>
        </div>

        <h1 className="text-4xl font-bold tracking-[-0.02em] text-white">
          Edit resource
        </h1>

        <p className="mt-3 text-base leading-7 text-slate-300">
          Update{" "}
          <strong className="text-white">
            {resource.name}
          </strong>
          .
        </p>
      </div>

      {!resource.isActive ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-400">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
          <p>
            This resource is currently
            inactive and will not be
            available for new bookings.
          </p>
        </div>
      ) : null}

      <ResourceForm
        organizationSlug={
          context.organizationSlug
        }
        resource={resource}
      />
    </section>
  );
}