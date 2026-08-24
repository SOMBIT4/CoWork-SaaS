import { requireOrganizationContext } from "@/server/authz/org-context";

interface ResourcesPageProps {
  params: Promise<{
    orgSlug: string;
  }>;
}

export default async function ResourcesPage({
  params,
}: ResourcesPageProps) {
  const { orgSlug } =
    await params;

  const context =
    await requireOrganizationContext(
      orgSlug,
    );

  return (
    <section>
      <h2 className="text-3xl font-semibold">
        Resources
      </h2>

      <p className="mt-2 text-neutral-600">
        View coworking resources for{" "}
        {context.organizationName}.
      </p>

      <div className="mt-8 rounded-xl border border-dashed bg-white p-8 text-sm text-neutral-500">
        Resource CRUD will be implemented
        in Section 20.
      </div>
    </section>
  );
}