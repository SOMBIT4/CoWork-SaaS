import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SignupForm } from "@/components/auth/signup-form";

export default async function SignupPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/onboarding");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12">
      <section className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-neutral-500">
            CoWork
          </p>

          <h1 className="text-2xl font-semibold">
            Create your account
          </h1>

          <p className="mt-2 text-sm text-neutral-600">
            Start managing your coworking
            organization.
          </p>
        </div>

        <SignupForm />

        <p className="mt-6 text-center text-sm text-neutral-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-black underline"
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}