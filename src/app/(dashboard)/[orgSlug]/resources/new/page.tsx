import {
  ResourceForm,
} from "@/components/resources/resource-form";
import {
  requireOrganizationPermission,
} from "@/server/authz/org-context";
import {
  Plus,
} from "lucide-react";

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
    <section className="max-w-3xl space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-3">
         
        
        </div>

        <h1 className="text-4xl font-bold tracking-[-0.02em] text-white">
          Create resource
        </h1>

        <p className="mt-3 text-base leading-7 text-slate-300">
          Add a desk, room or cabin
          to{" "}
          {
            context.organizationName
          }.
        </p>
      </div>

      <ResourceForm
        organizationSlug={
          context.organizationSlug
        }
      />
    </section>
  );
}