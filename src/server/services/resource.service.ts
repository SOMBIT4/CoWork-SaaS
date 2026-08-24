import "server-only";

import {
  isUniqueViolation,
} from "@/lib/db/errors";
import {
  withTransaction,
} from "@/lib/db/transaction";
import type {
  ResourceInput,
} from "@/lib/validation/resource";
import {
  assertOrganizationPermission,
} from "@/server/authz/roles";
import {
  insertAuditLog,
} from "@/server/repositories/audit.repository";
import {
  createResource,
  deactivateResource,
  updateResource,
} from "@/server/repositories/resource.repository";
import type {
  OrganizationContext,
  Resource,
} from "@/types/domain";

export class ResourceNameTakenError
  extends Error {
  readonly code =
    "RESOURCE_NAME_TAKEN";

  constructor() {
    super(
      "A resource with this name already exists.",
    );

    this.name =
      "ResourceNameTakenError";
  }
}

export class ResourceNotFoundError
  extends Error {
  readonly code =
    "RESOURCE_NOT_FOUND";

  constructor() {
    super(
      "The resource could not be found.",
    );

    this.name =
      "ResourceNotFoundError";
  }
}

interface CreateResourceForOrganizationInput {
  context: OrganizationContext;
  resource: ResourceInput;
}

export async function createResourceForOrganization({
  context,
  resource: input,
}: CreateResourceForOrganizationInput): Promise<Resource> {
  assertOrganizationPermission(
    context.role,
    "MANAGE_RESOURCES",
  );

  try {
    return await withTransaction(
      async (client) => {
        const resource =
          await createResource(
            client,
            context.organizationId,
            context.userId,
            input,
          );

        await insertAuditLog(
          client,
          {
            organizationId:
              context.organizationId,

            actorUserId:
              context.userId,

            action:
              "RESOURCE_CREATED",

            entityType:
              "resource",

            entityId:
              resource.id,

            metadata: {
              name: resource.name,
              type: resource.type,
              capacity:
                resource.capacity,
            },
          },
        );

        return resource;
      },
    );
  } catch (error) {
    if (
      isUniqueViolation(
        error,
        "resources_org_name_unique",
      )
    ) {
      throw new ResourceNameTakenError();
    }

    throw error;
  }
}

interface UpdateOrganizationResourceInput {
  context: OrganizationContext;
  resourceId: string;
  resource: ResourceInput;
}

export async function updateOrganizationResource({
  context,
  resourceId,
  resource: input,
}: UpdateOrganizationResourceInput): Promise<Resource> {
  assertOrganizationPermission(
    context.role,
    "MANAGE_RESOURCES",
  );

  try {
    return await withTransaction(
      async (client) => {
        const resource =
          await updateResource(
            client,
            context.organizationId,
            resourceId,
            input,
          );

        if (!resource) {
          throw new ResourceNotFoundError();
        }

        await insertAuditLog(
          client,
          {
            organizationId:
              context.organizationId,

            actorUserId:
              context.userId,

            action:
              "RESOURCE_UPDATED",

            entityType:
              "resource",

            entityId:
              resource.id,

            metadata: {
              name: resource.name,
              type: resource.type,
              capacity:
                resource.capacity,
            },
          },
        );

        return resource;
      },
    );
  } catch (error) {
    if (
      isUniqueViolation(
        error,
        "resources_org_name_unique",
      )
    ) {
      throw new ResourceNameTakenError();
    }

    throw error;
  }
}

interface DeactivateOrganizationResourceInput {
  context: OrganizationContext;
  resourceId: string;
}

export async function deactivateOrganizationResource({
  context,
  resourceId,
}: DeactivateOrganizationResourceInput): Promise<Resource> {
  assertOrganizationPermission(
    context.role,
    "MANAGE_RESOURCES",
  );

  return withTransaction(
    async (client) => {
      const resource =
        await deactivateResource(
          client,
          context.organizationId,
          resourceId,
        );

      if (!resource) {
        throw new ResourceNotFoundError();
      }

      await insertAuditLog(
        client,
        {
          organizationId:
            context.organizationId,

          actorUserId:
            context.userId,

          action:
            "RESOURCE_DEACTIVATED",

          entityType:
            "resource",

          entityId:
            resource.id,

          metadata: {
            name: resource.name,
          },
        },
      );

      return resource;
    },
  );
}