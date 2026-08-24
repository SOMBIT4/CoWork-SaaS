import { CreateBookingForm } from "@/components/bookings/create-booking-form";
import { requireOrganizationPermission } from "@/server/authz/org-context";
import { listResources } from "@/server/repositories/resource.repository";

interface NewBookingPageProps {
  params: Promise<{
    orgSlug: string;
  }>;
}

export default async function NewBookingPage({
  params,
}: NewBookingPageProps) {
  const { orgSlug } = await params;

  const context =
    await requireOrganizationPermission(
      orgSlug,
      "CREATE_BOOKING",
    );

  const resources =
    await listResources(
      context.organizationId,
      {
        status: "active",
      },
    );

  return (
    <section className="max-w-2xl">
      <p className="text-sm font-medium text-neutral-500">
        Bookings
      </p>

      <h2 className="mt-2 text-3xl font-semibold">
        Create booking
      </h2>

      <p className="mt-2 text-neutral-600">
        Reserve an active workspace resource in{" "}
        {context.organizationName}.
      </p>

      {resources.length === 0 ? (
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          There are no active resources available for booking.
        </div>
      ) : (
        <div className="mt-8 rounded-xl border bg-white p-6">
          <CreateBookingForm
            organizationSlug={
              context.organizationSlug
            }
            organizationTimezone={
              context.organizationTimezone
            }
            resources={resources.map(
              (resource) => ({
                id: resource.id,
                name: resource.name,
                type: resource.type,
                capacity: resource.capacity,
              }),
            )}
          />
        </div>
      )}
    </section>
  );
}