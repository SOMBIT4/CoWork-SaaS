import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";

interface LoginPageProps {
  searchParams: Promise<{
    registered?: string | string[];
    callbackUrl?: string | string[];
  }>;
}

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const session = await auth();

  if (session?.user) {
    redirect("/onboarding");
  }

  const parameters = await searchParams;

  const registered =
    parameters.registered === "1";

  const callbackUrl =
    typeof parameters.callbackUrl === "string"
      ? parameters.callbackUrl
      : "/onboarding";

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12">
      <section className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-neutral-500">
            CoWork
          </p>

          <h1 className="text-2xl font-semibold">
            Sign in
          </h1>

          <p className="mt-2 text-sm text-neutral-600">
            Access your organizations, resources,
            and bookings.
          </p>
        </div>

        {registered ? (
          <div
            role="status"
            className="mb-5 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700"
          >
            Account created successfully. You can
            now sign in.
          </div>
        ) : null}

        <LoginForm
          callbackUrl={callbackUrl}
        />

        <p className="mt-6 text-center text-sm text-neutral-600">
          Do not have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-black underline"
          >
            Create one
          </Link>
        </p>
      </section>
    </main>
  );
}