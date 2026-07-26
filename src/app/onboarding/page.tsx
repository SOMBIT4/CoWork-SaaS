import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { logoutAction } from "@/server/actions/auth.actions";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-16">
      <section className="mx-auto max-w-2xl rounded-xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-neutral-500">
          Authentication successful
        </p>

        <h1 className="mt-2 text-3xl font-semibold">
          Welcome,{" "}
          {session.user.name ??
            session.user.email ??
            "CoWork user"}
        </h1>

        <p className="mt-4 text-neutral-600">
          You are signed in. Organization
          onboarding will be implemented in the
          next project phase.
        </p>

        <dl className="mt-8 space-y-4 rounded-lg bg-neutral-50 p-5 text-sm">
          <div>
            <dt className="font-medium">
              User ID
            </dt>
            <dd className="mt-1 break-all text-neutral-600">
              {session.user.id}
            </dd>
          </div>

          <div>
            <dt className="font-medium">
              Email
            </dt>
            <dd className="mt-1 text-neutral-600">
              {session.user.email}
            </dd>
          </div>
        </dl>

        <form
          action={logoutAction}
          className="mt-8"
        >
          <button
            type="submit"
            className="rounded-md border px-4 py-2 font-medium hover:bg-neutral-50"
          >
            Sign out
          </button>
        </form>
      </section>
    </main>
  );
}