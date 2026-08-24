import {
  describe,
  expect,
  it,
} from "vitest";

import {
  generateInvitationToken,
  hashInvitationToken,
} from "../../src/lib/security/invitation-token";
import {
  changeMemberRoleSchema,
  inviteMemberSchema,
  invitationTokenSchema,
} from "../../src/lib/validation/invitation";

describe(
  "invitation security",
  () => {
    it(
      "generates a raw token and hash",
      () => {
        const result =
          generateInvitationToken();

        expect(
          result.rawToken,
        ).toBeTruthy();

        expect(
          result.tokenHash,
        ).toBeTruthy();

        expect(
          result.rawToken,
        ).not.toBe(
          result.tokenHash,
        );
      },
    );

    it(
      "hashes the same token consistently",
      () => {
        const token =
          "example-token-for-testing-123456789";

        expect(
          hashInvitationToken(
            token,
          ),
        ).toBe(
          hashInvitationToken(
            token,
          ),
        );
      },
    );

    it(
      "generates different invitation tokens",
      () => {
        const first =
          generateInvitationToken();

        const second =
          generateInvitationToken();

        expect(
          first.rawToken,
        ).not.toBe(
          second.rawToken,
        );

        expect(
          first.tokenHash,
        ).not.toBe(
          second.tokenHash,
        );
      },
    );

    it(
      "accepts generated tokens",
      () => {
        const generated =
          generateInvitationToken();

        expect(
          invitationTokenSchema.safeParse(
            generated.rawToken,
          ).success,
        ).toBe(true);
      },
    );
  },
);

describe(
  "invitation validation",
  () => {
    it(
      "normalizes email to lowercase",
      () => {
        const result =
          inviteMemberSchema.parse({
            email:
              "USER@EXAMPLE.COM",
            role:
              "MEMBER",
          });

        expect(
          result.email,
        ).toBe(
          "user@example.com",
        );
      },
    );

    it(
      "allows member invitations",
      () => {
        expect(
          inviteMemberSchema.safeParse({
            email:
              "user@example.com",
            role:
              "MEMBER",
          }).success,
        ).toBe(true);
      },
    );

    it(
      "allows admin invitations",
      () => {
        expect(
          inviteMemberSchema.safeParse({
            email:
              "admin@example.com",
            role:
              "ADMIN",
          }).success,
        ).toBe(true);
      },
    );

    it(
      "rejects owner invitations",
      () => {
        expect(
          inviteMemberSchema.safeParse({
            email:
              "owner@example.com",
            role:
              "OWNER",
          }).success,
        ).toBe(false);
      },
    );

    it(
      "rejects changing a normal member to owner",
      () => {
        expect(
          changeMemberRoleSchema.safeParse({
            role:
              "OWNER",
          }).success,
        ).toBe(false);
      },
    );
  },
);