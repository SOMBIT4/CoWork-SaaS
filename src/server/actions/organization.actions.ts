"use server";

import { redirect } from "next/navigation";

import { createOrganizationSchema } from "@/lib/validation/organization";
import { requireAuthenticatedUserId } from "@/server/authz/org-context";
import {
  createOrganizationForUser,
  OrganizationSlugTakenError,
} from "@/server/services/organization.service";

type OrganizationField =
  | "name"
  | "slug"
  | "timezone";

export interface OrganizationActionState {
  status: "idle" | "error";

  message?: string;

  fieldErrors?: Partial<
    Record<
      OrganizationField,
      string[]
    >
  >;
}

export async function createOrganizationAction(
  previousState: OrganizationActionState,
  formData: FormData,
): Promise<OrganizationActionState> {
  void previousState;

  const userId =
    await requireAuthenticatedUserId();

  const parsed =
    createOrganizationSchema.safeParse({
      name: formData.get("name"),
      slug: formData.get("slug"),
      timezone:
        formData.get("timezone"),
    });

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

  let created;

  try {
    created =
      await createOrganizationForUser({
        userId,
        organization: parsed.data,
      });
  } catch (error) {
    if (
      error instanceof
      OrganizationSlugTakenError
    ) {
      return {
        status: "error",

        message:
          "That organization URL is already in use.",

        fieldErrors: {
          slug: [
            "Choose another organization slug.",
          ],
        },
      };
    }

    throw error;
  }

  redirect(
    `/${created.organization.slug}`,
  );
}