"use server";

import {
  revalidatePath,
} from "next/cache";
import {
  redirect,
} from "next/navigation";

import {
  resourceIdSchema,
  resourceSchema,
} from "@/lib/validation/resource";
import {
  requireOrganizationPermission,
} from "@/server/authz/org-context";
import {
  createResourceForOrganization,
  deactivateOrganizationResource,
  ResourceNameTakenError,
  ResourceNotFoundError,
  updateOrganizationResource,
} from "@/server/services/resource.service";

type ResourceField =
  | "name"
  | "type"
  | "capacity"
  | "floor"
  | "description";

export interface ResourceActionState {
  status:
    | "idle"
    | "error";

  message?: string;

  fieldErrors?: Partial<
    Record<
      ResourceField,
      string[]
    >
  >;
}

function parseResourceForm(
  formData: FormData,
) {
  return resourceSchema.safeParse({
    name:
      formData.get("name"),

    type:
      formData.get("type"),

    capacity:
      formData.get(
        "capacity",
      ),

    floor:
      formData.get("floor"),

    description:
      formData.get(
        "description",
      ),
  });
}

export async function createResourceAction(
  orgSlug: string,
  previousState: ResourceActionState,
  formData: FormData,
): Promise<ResourceActionState> {
  void previousState;

  const context =
    await requireOrganizationPermission(
      orgSlug,
      "MANAGE_RESOURCES",
    );

  const parsed =
    parseResourceForm(
      formData,
    );

  if (!parsed.success) {
    return {
      status: "error",

      message:
        "Please correct the highlighted fields.",

      fieldErrors:
        parsed.error.flatten()
          .fieldErrors,
    };
  }

  try {
    await createResourceForOrganization({
      context,
      resource: parsed.data,
    });
  } catch (error) {
    if (
      error instanceof
      ResourceNameTakenError
    ) {
      return {
        status: "error",

        message:
          "A resource with this name already exists.",

        fieldErrors: {
          name: [
            "Choose another resource name.",
          ],
        },
      };
    }

    throw error;
  }

  revalidatePath(
    `/${context.organizationSlug}/resources`,
  );

  redirect(
    `/${context.organizationSlug}/resources`,
  );
}

export async function updateResourceAction(
  orgSlug: string,
  resourceId: string,
  previousState: ResourceActionState,
  formData: FormData,
): Promise<ResourceActionState> {
  void previousState;

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
    return {
      status: "error",
      message:
        "Invalid resource.",
    };
  }

  const parsed =
    parseResourceForm(
      formData,
    );

  if (!parsed.success) {
    return {
      status: "error",

      message:
        "Please correct the highlighted fields.",

      fieldErrors:
        parsed.error.flatten()
          .fieldErrors,
    };
  }

  try {
    await updateOrganizationResource({
      context,
      resourceId:
        parsedId.data,
      resource: parsed.data,
    });
  } catch (error) {
    if (
      error instanceof
      ResourceNameTakenError
    ) {
      return {
        status: "error",

        message:
          "A resource with this name already exists.",

        fieldErrors: {
          name: [
            "Choose another resource name.",
          ],
        },
      };
    }

    if (
      error instanceof
      ResourceNotFoundError
    ) {
      return {
        status: "error",

        message:
          "The resource could not be found.",
      };
    }

    throw error;
  }

  revalidatePath(
    `/${context.organizationSlug}/resources`,
  );

  redirect(
    `/${context.organizationSlug}/resources`,
  );
}

export async function deactivateResourceAction(
  orgSlug: string,
  resourceId: string,
  formData: FormData,
): Promise<void> {
  void formData;

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
    return;
  }

  try {
    await deactivateOrganizationResource({
      context,
      resourceId: parsedId.data,
    });
  } catch (error) {
    if (
      error instanceof
      ResourceNotFoundError
    ) {
      return;
    }

    throw error;
  }

  revalidatePath(
    `/${context.organizationSlug}/resources`,
  );
}