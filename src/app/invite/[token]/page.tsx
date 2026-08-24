import Link from "next/link";

import { auth } from "@/auth";
import {
  AcceptInvitationForm,
} from "@/components/members/accept-invitation-form";
import {
  hashInvitationToken,
} from "@/lib/security/invitation-token";
import {
  invitationTokenSchema,
} from "@/lib/validation/invitation";
import {
  findUsableInvitationPreview,
} from "@/server/repositories/invitation.repository";

interface InvitationPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function InvitationPage({
  params,
}: InvitationPageProps) {
  const { token } =
    await params;

  const parsed =
    invitationTokenSchema.safeParse(
      token,
    );

  if (!parsed.success) {
    return (
      <InvitationUnavailable />
    );
  }

  const tokenHash =
    hashInvitationToken(
      parsed.data,
    );

  /*
   * SQL checks accepted_at and
   * expires_at > NOW(), so there is
   * no impure Date.now() call during
   * React rendering.
   */
  const invitation =
    await findUsableInvitationPreview(
      tokenHash,
    );

  if (!invitation) {
    return (
      <InvitationUnavailable />
    );
  }

  const session =
    await auth();

  const callbackUrl =
    `/invite/${token}`;

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12">
      <section className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-neutral-500">
          CoWork invitation
        </p>

        <h1 className="mt-2 text-2xl font-semibold">
          Join{" "}
          {
            invitation.organizationName
          }
        </h1>

        <p className="mt-3 text-sm text-neutral-600">
          You have been invited as{" "}
          <strong>
            {invitation.role}
          </strong>
          .
        </p>

        {!session?.user?.id ? (
          <div className="mt-8">
            <p className="mb-4 text-sm text-neutral-600">
              Sign in with the email address that received this invitation.
            </p>

            <Link
              href={`/login?callbackUrl=${encodeURIComponent(
                callbackUrl,
              )}`}
              className="block w-full rounded-md bg-black px-4 py-2 text-center font-medium text-white"
            >
              Sign in to continue
            </Link>
          </div>
        ) : (
          <div className="mt-8">
            <AcceptInvitationForm
              token={token}
            />
          </div>
        )}
      </section>
    </main>
  );
}

function InvitationUnavailable() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <section className="w-full max-w-md rounded-xl border bg-white p-8 text-center">
        <h1 className="text-2xl font-semibold">
          Invitation unavailable
        </h1>

        <p className="mt-3 text-sm text-neutral-600">
          This invitation is invalid, expired, or has already been used.
        </p>

        <Link
          href="/"
          className="mt-6 inline-block rounded-md border px-4 py-2 text-sm font-medium"
        >
          Return home
        </Link>
      </section>
    </main>
  );
}