import {
  Armchair,
  Building2,
  DoorOpen,
  Filter,
  Layers3,
  Pencil,
  Plus,
  Search,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";

import {
  DeactivateResourceButton,
} from "@/components/resources/deactivate-resource-button";
import {
  resourceFilterSchema,
  type ResourceFilters,
} from "@/lib/validation/resource";
import {
  requireOrganizationContext,
} from "@/server/authz/org-context";
import {
  hasOrganizationPermission,
} from "@/server/authz/roles";
import {
  listResources,
} from "@/server/repositories/resource.repository";
import type {
  Resource,
  ResourceType,
} from "@/types/domain";

interface ResourcesPageProps {
  params: Promise<{
    orgSlug: string;
  }>;

  searchParams: Promise<
    Record<
      string,
      string | string[] | undefined
    >
  >;
}

function getSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function getResourceIcon(
  type: ResourceType,
) {
  switch (type) {
    case "DESK":
      return Armchair;

    case "ROOM":
      return DoorOpen;

    case "CABIN":
      return Building2;
  }
}

function formatResourceType(
  type: ResourceType,
): string {
  switch (type) {
    case "DESK":
      return "Desk";

    case "ROOM":
      return "Room";

    case "CABIN":
      return "Cabin";
  }
}

function hasCustomFilters(
  filters: ResourceFilters,
): boolean {
  return Boolean(
    filters.search ||
      filters.type ||
      filters.floor ||
      filters.minCapacity !== undefined ||
      filters.status !== "active",
  );
}

interface ResourceCardProps {
  resource: Resource;
  organizationSlug: string;
  canManageResources: boolean;
}

function ResourceCard({
  resource,
  organizationSlug,
  canManageResources,
}: ResourceCardProps) {
  // Get the icon type based on resource type
  const iconType = resource.type;
  
  // Render the appropriate icon based on type
  const renderIcon = () => {
    const iconProps = {
      className: "size-5",
      strokeWidth: 2.5,
    };
    
    switch (iconType) {
      case "DESK":
        return <Armchair {...iconProps} />;
      case "ROOM":
        return <DoorOpen {...iconProps} />;
      case "CABIN":
        return <Building2 {...iconProps} />;
    }
  };

  return (
    <article
      className={[
        "group relative overflow-hidden rounded-2xl border backdrop-blur-xl p-6 shadow-2xl transition-all duration-300",
        resource.isActive
          ? "border-slate-700/30 bg-gradient-to-br from-slate-800/90 to-slate-900/90 shadow-slate-950/30 hover:-translate-y-1 hover:border-slate-600/50 hover:shadow-3xl hover:shadow-slate-950/40"
          : "border-slate-700/20 bg-gradient-to-br from-slate-800/60 to-slate-900/60 shadow-slate-950/20 opacity-70",
      ].join(" ")}
    >
      {/* Gradient orb effect */}
      <div className="absolute -right-12 -top-12 size-32 rounded-full bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-transparent blur-3xl transition-all duration-500 group-hover:scale-150" />
      
      {/* Animated border glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))",
        }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <div
              className={[
                "flex size-14 shrink-0 items-center justify-center rounded-xl border shadow-lg transition-all duration-300",
                resource.isActive
                  ? "border-slate-600/50 bg-gradient-to-br from-slate-700 to-slate-800 text-blue-400 shadow-blue-500/20 group-hover:scale-110 group-hover:shadow-blue-500/30"
                  : "border-slate-700/50 bg-slate-800/50 text-slate-500",
              ].join(" ")}
            >
              {renderIcon()}
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold tracking-tight text-white group-hover:text-blue-50">
                {resource.name}
              </h2>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-slate-600/50 bg-slate-700/50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-300">
                  {formatResourceType(
                    resource.type,
                  )}
                </span>

                <span
                  className={[
                    "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em]",
                    resource.isActive
                      ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-inset ring-emerald-500/30"
                      : "bg-slate-700/50 text-slate-500 ring-1 ring-inset ring-slate-600/50",
                  ].join(" ")}
                >
                  {resource.isActive
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-700/40 bg-slate-800/40 p-4 backdrop-blur-sm transition-all duration-300 hover:border-slate-600/50 hover:bg-slate-800/60 group-hover:border-slate-600/40">
            <div className="flex items-center gap-2 text-slate-400">
              <Users
                className="size-4"
                strokeWidth={2.5}
              />

              <p className="text-[11px] font-bold uppercase tracking-wide">
                Capacity
              </p>
            </div>

            <p className="mt-2 text-sm font-bold text-white">
              {resource.capacity}{" "}
              {resource.capacity === 1
                ? "person"
                : "people"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-700/40 bg-slate-800/40 p-4 backdrop-blur-sm transition-all duration-300 hover:border-slate-600/50 hover:bg-slate-800/60 group-hover:border-slate-600/40">
            <div className="flex items-center gap-2 text-slate-400">
              <Layers3
                className="size-4"
                strokeWidth={2.5}
              />

              <p className="text-[11px] font-bold uppercase tracking-wide">
                Floor
              </p>
            </div>

            <p className="mt-2 truncate text-sm font-bold text-white">
              {resource.floor ??
                "Not specified"}
            </p>
          </div>
        </div>

        {resource.description ? (
          <p className="mt-5 line-clamp-2 text-sm leading-6 text-slate-300">
            {resource.description}
          </p>
        ) : (
          <p className="mt-5 text-sm italic text-slate-500">
            No description provided.
          </p>
        )}
      </div>

      {canManageResources ? (
        <div className="relative z-10 mt-6 flex flex-wrap items-center gap-2 border-t border-slate-700/50 pt-4">
          <Link
            href={`/${organizationSlug}/resources/${resource.id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 transition-all hover:bg-slate-700/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <Pencil
              className="size-3.5"
              strokeWidth={2.5}
            />

            Edit
          </Link>

          {resource.isActive ? (
            <DeactivateResourceButton
              organizationSlug={
                organizationSlug
              }
              resourceId={
                resource.id
              }
              resourceName={
                resource.name
              }
            />
          ) : (
            <span className="px-3 py-2 text-xs font-medium text-slate-500">
              Resource deactivated
            </span>
          )}
        </div>
      ) : null}
    </article>
  );
}

export default async function ResourcesPage({
  params,
  searchParams,
}: ResourcesPageProps) {
  const { orgSlug } =
    await params;

  const queryParams =
    await searchParams;

  const context =
    await requireOrganizationContext(
      orgSlug,
    );

  const parsedFilters =
    resourceFilterSchema.safeParse({
      status: getSearchParam(
        queryParams.status,
      ),

      type: getSearchParam(
        queryParams.type,
      ),

      minCapacity: getSearchParam(
        queryParams.minCapacity,
      ),

      floor: getSearchParam(
        queryParams.floor,
      ),

      search: getSearchParam(
        queryParams.search,
      ),
    });

  const filters: ResourceFilters =
    parsedFilters.success
      ? parsedFilters.data
      : resourceFilterSchema.parse(
          {},
        );

  const [
    resources,
    allResources,
  ] = await Promise.all([
    listResources(
      context.organizationId,
      filters,
    ),

    listResources(
      context.organizationId,
      {
        status: "all",
      },
    ),
  ]);

  const canManageResources =
    hasOrganizationPermission(
      context.role,
      "MANAGE_RESOURCES",
    );

  const activeCount =
    allResources.filter(
      (resource) =>
        resource.isActive,
    ).length;

  const inactiveCount =
    allResources.length -
    activeCount;

  const filtersApplied =
    hasCustomFilters(
      filters,
    );

  const root =
    `/${context.organizationSlug}`;

  return (
    <section className="space-y-8">
      {/* Page heading */}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
            Workspace inventory
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-[-0.02em] text-white sm:text-5xl">
            Resources
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
            Manage desks, rooms and
            cabins available inside{" "}
            {
              context.organizationName
            }
            .
          </p>
        </div>

        {canManageResources ? (
          <Link
            href={`${root}/resources/new`}
            className="relative inline-flex w-fit items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Plus
              className="size-4"
              strokeWidth={2.5}
            />

            Add resource
          </Link>
        ) : null}
      </div>

      {/* Overview */}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/40 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-6 shadow-xl shadow-slate-950/30 transition-all hover:border-slate-600/50 hover:shadow-2xl">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total resources
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-white">
            {allResources.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-700/40 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-6 shadow-xl shadow-slate-950/30 transition-all hover:border-slate-600/50 hover:shadow-2xl">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"
            />

            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active
            </p>
          </div>

          <p className="mt-3 text-3xl font-bold tracking-tight text-white">
            {activeCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-700/40 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-6 shadow-xl shadow-slate-950/30 transition-all hover:border-slate-600/50 hover:shadow-2xl">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-slate-500"
            />

            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Inactive
            </p>
          </div>

          <p className="mt-3 text-3xl font-bold tracking-tight text-white">
            {inactiveCount}
          </p>
        </div>
      </div>

      {/* Filters */}

      <div className="rounded-2xl border border-slate-700/40 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-6 shadow-xl shadow-slate-950/30">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter
              className="size-4 text-blue-400"
              strokeWidth={2.5}
            />

            <p className="text-sm font-bold text-white">
              Filter resources
            </p>
          </div>

          {filtersApplied ? (
            <Link
              href={`${root}/resources`}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-400 transition-all hover:bg-slate-700/50 hover:text-white"
            >
              <X className="size-3.5" strokeWidth={2.5} />

              Reset
            </Link>
          ) : null}
        </div>

        <form
          action={`${root}/resources`}
          method="get"
          className="grid gap-3 lg:grid-cols-[minmax(220px,1.7fr)_repeat(4,minmax(130px,1fr))_auto]"
        >
          <div className="relative">
            <label
              htmlFor="resource-search"
              className="sr-only"
            >
              Search resources
            </label>

            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              strokeWidth={2.5}
            />

            <input
              id="resource-search"
              name="search"
              type="search"
              defaultValue={
                filters.search ?? ""
              }
              placeholder="Search resources..."
              className="h-11 w-full rounded-xl border border-slate-700/50 bg-slate-900/50 pl-10 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <select
            name="type"
            aria-label="Resource type"
            defaultValue={
              filters.type ?? ""
            }
            className="h-11 rounded-xl border border-slate-700/50 bg-slate-900/50 px-3 text-sm text-white outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">
              All types
            </option>

            <option value="DESK">
              Desk
            </option>

            <option value="ROOM">
              Room
            </option>

            <option value="CABIN">
              Cabin
            </option>
          </select>

          <select
            name="status"
            aria-label="Resource status"
            defaultValue={
              filters.status
            }
            className="h-11 rounded-xl border border-slate-700/50 bg-slate-900/50 px-3 text-sm text-white outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>

            <option value="all">
              All statuses
            </option>
          </select>

          <input
            name="minCapacity"
            type="number"
            min={1}
            max={500}
            step={1}
            defaultValue={
              filters.minCapacity ??
              ""
            }
            placeholder="Min capacity"
            aria-label="Minimum capacity"
            className="h-11 rounded-xl border border-slate-700/50 bg-slate-900/50 px-3 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />

          <input
            name="floor"
            type="text"
            maxLength={50}
            defaultValue={
              filters.floor ?? ""
            }
            placeholder="Floor"
            aria-label="Floor"
            className="h-11 rounded-xl border border-slate-700/50 bg-slate-900/50 px-3 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />

          <button
            type="submit"
            className="h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Apply
          </button>
        </form>
      </div>

      {/* Result information */}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-300">
          Showing{" "}
          <span className="font-bold text-white">
            {resources.length}
          </span>{" "}
          {resources.length === 1
            ? "resource"
            : "resources"}
        </p>

        {filtersApplied ? (
          <p className="text-xs text-slate-500">
            Filters are currently
            applied
          </p>
        ) : null}
      </div>

      {/* Resource collection */}

      {resources.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {resources.map(
            (resource) => (
              <ResourceCard
                key={
                  resource.id
                }
                resource={
                  resource
                }
                organizationSlug={
                  context.organizationSlug
                }
                canManageResources={
                  canManageResources
                }
              />
            ),
          )}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-700/40 border-dashed bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl px-6 py-20 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-slate-700/50 bg-slate-800/50 text-slate-400">
            <Search
              className="size-7"
              strokeWidth={2}
            />
          </div>

          <h2 className="mt-6 text-xl font-bold tracking-tight text-white">
            {filtersApplied
              ? "No resources match these filters"
              : "No resources yet"}
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
            {filtersApplied
              ? "Try changing or clearing your filters to see more resources."
              : "Create your first desk, room or cabin to start accepting bookings."}
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {filtersApplied ? (
              <Link
                href={`${root}/resources`}
                className="rounded-xl border border-slate-600/50 bg-slate-800/60 px-5 py-2.5 text-sm font-bold text-slate-200 transition-all hover:border-slate-500/60 hover:bg-slate-700/60 hover:text-white"
              >
                Clear filters
              </Link>
            ) : null}

            {canManageResources ? (
              <Link
                href={`${root}/resources/new`}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40"
              >
                <Plus className="size-4" strokeWidth={2.5} />

                Add resource
              </Link>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}