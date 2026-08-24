import { redirect } from "next/navigation";

import { CreateOrganizationForm } from "@/components/organizations/create-organization-form";
import { requireAuthenticatedUserId } from "@/server/authz/org-context";
import { findFirstOrganizationForUser } from "@/server/repositories/organization.repository";

export default async function OnboardingPage() {
  const userId =
    await requireAuthenticatedUserId();

  /*
   * Onboarding is only for users who do not yet
   * belong to an organization.
   */
  const existingOrganization =
    await findFirstOrganizationForUser(
      userId,
    );

  if (existingOrganization) {
    redirect(
      `/${existingOrganization.slug}`,
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12">
      <section className="w-full max-w-lg rounded-xl border bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-sm font-medium text-neutral-500">
            CoWork
          </p>

          <h1 className="mt-2 text-2xl font-semibold">
            Create your organization
          </h1>

          <p className="mt-2 text-sm text-neutral-600">
            Set up your coworking workspace.
            You will automatically become
            its owner.
          </p>
        </div>

        <CreateOrganizationForm />
      </section>
    </main>
  );
}