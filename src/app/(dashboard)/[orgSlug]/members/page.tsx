import {
  InviteMemberForm,
} from "@/components/members/invite-member-form";
import {
  MemberActions,
} from "@/components/members/member-actions";
import {
  requireOrganizationPermission,
} from "@/server/authz/org-context";
import {
  listOrganizationMembers,
  listPendingInvitations,
} from "@/server/repositories/invitation.repository";

interface MembersPageProps {
  params: Promise<{
    orgSlug: string;
  }>;
}

export default async function MembersPage({
  params,
}: MembersPageProps) {
  const { orgSlug } =
    await params;

  const context =
    await requireOrganizationPermission(
      orgSlug,
      "MANAGE_MEMBERS",
    );

  const [
    members,
    invitations,
  ] = await Promise.all([
    listOrganizationMembers(
      context.organizationId,
    ),

    listPendingInvitations(
      context.organizationId,
    ),
  ]);

  return (
    <section>
      <div>
        <p className="text-sm font-medium text-neutral-500">
          Organization access
        </p>

        <h2 className="mt-2 text-3xl font-semibold">
          Members
        </h2>

        <p className="mt-2 text-neutral-600">
          Manage access to{" "}
          {context.organizationName}.
        </p>
      </div>

      <div className="mt-8 rounded-xl border bg-white p-5">
        <h3 className="font-semibold">
          Invite member
        </h3>

        <p className="mt-1 text-sm text-neutral-500">
          Invitations expire after 48 hours.
        </p>

        <div className="mt-4">
          <InviteMemberForm
            organizationSlug={
              context.organizationSlug
            }
          />
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border bg-white">
        <div className="border-b px-5 py-4">
          <h3 className="font-semibold">
            Current members
          </h3>

          <p className="mt-1 text-sm text-neutral-500">
            {members.length} organization member
            {members.length === 1
              ? ""
              : "s"}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-neutral-50">
              <tr>
                <th className="px-5 py-3 font-medium">
                  Member
                </th>

                <th className="px-5 py-3 font-medium">
                  Email
                </th>

                <th className="px-5 py-3 font-medium">
                  Role
                </th>

                <th className="px-5 py-3 font-medium">
                  Joined
                </th>

                <th className="px-5 py-3 text-right font-medium">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {members.map(
                (member) => (
                  <tr
                    key={
                      member.membershipId
                    }
                  >
                    <td className="px-5 py-4 font-medium">
                      {member.name}
                    </td>

                    <td className="px-5 py-4 text-neutral-600">
                      {member.email}
                    </td>

                    <td className="px-5 py-4">
                      {member.role}
                    </td>

                    <td className="px-5 py-4 text-neutral-600">
                      {member.createdAt.toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4">
                      <MemberActions
                        organizationSlug={
                          context.organizationSlug
                        }
                        membershipId={
                          member.membershipId
                        }
                        memberName={
                          member.name
                        }
                        role={
                          member.role
                        }
                      />
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 rounded-xl border bg-white">
        <div className="border-b px-5 py-4">
          <h3 className="font-semibold">
            Pending invitations
          </h3>
        </div>

        {invitations.length === 0 ? (
          <p className="p-5 text-sm text-neutral-500">
            No pending invitations.
          </p>
        ) : (
          <div className="divide-y">
            {invitations.map(
              (invitation) => (
                <div
                  key={
                    invitation.id
                  }
                  className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
                >
                  <div>
                    <p className="font-medium">
                      {
                        invitation.email
                      }
                    </p>

                    <p className="mt-1 text-xs text-neutral-500">
                      Role:{" "}
                      {
                        invitation.role
                      }
                    </p>
                  </div>

                  <p className="text-xs text-neutral-500">
                    Expires{" "}
                    {
                      invitation.expiresAt.toLocaleString()
                    }
                  </p>
                </div>
              ),
            )}
          </div>
        )}
      </div>
    </section>
  );
}