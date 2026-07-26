"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { signIn, signOut } from "@/auth";
import {
  isUniqueViolation,
} from "@/lib/db/errors";
import { withTransaction } from "@/lib/db/transaction";
import {
  loginSchema,
  signupSchema,
} from "@/lib/validation/auth";
import { insertUser } from "@/server/repositories/user.repository";

type AuthFieldName =
  | "name"
  | "email"
  | "password";

export interface AuthActionState {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<
    Record<AuthFieldName, string[]>
  >;
}

function getSafeRedirectPath(
  value: FormDataEntryValue | null,
): string {
  if (typeof value !== "string") {
    return "/onboarding";
  }

  const path = value.trim();

  if (
    !path.startsWith("/") ||
    path.startsWith("//")
  ) {
    return "/onboarding";
  }

  return path;
}

export async function signupAction(
  previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  void previousState;

  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message:
        "Please correct the highlighted fields.",
      fieldErrors:
        parsed.error.flatten().fieldErrors,
    };
  }

  const passwordHash = await bcrypt.hash(
    parsed.data.password,
    12,
  );

  try {
    await withTransaction((client) =>
      insertUser(client, {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
      }),
    );
  } catch (error) {
    if (
      isUniqueViolation(
        error,
        "users_email_unique",
      )
    ) {
      return {
        status: "error",
        message:
          "An account with this email already exists.",
        fieldErrors: {
          email: [
            "Use another email or sign in to your existing account.",
          ],
        },
      };
    }

    throw error;
  }

  redirect("/login?registered=1");
}

export async function loginAction(
  previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  void previousState;

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message:
        "Enter a valid email and password.",
      fieldErrors:
        parsed.error.flatten().fieldErrors,
    };
  }

  const redirectTo = getSafeRedirectPath(
    formData.get("callbackUrl"),
  );

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return {
          status: "error",
          message:
            "Invalid email or password.",
        };
      }

      console.error(
        "Unexpected authentication error:",
        error,
      );

      return {
        status: "error",
        message:
          "Unable to sign in right now. Try again.",
      };
    }

    /*
     * Successful Auth.js sign-in uses Next.js redirect,
     * which throws internally. It must be rethrown.
     */
    throw error;
  }

  return {
    status: "error",
    message:
      "Unable to complete authentication.",
  };
}

export async function logoutAction(): Promise<void> {
  await signOut({
    redirectTo: "/login",
  });
}