import {
  describe,
  expect,
  it,
} from "vitest";

import {
  assertMinimumRole,
  assertOrganizationPermission,
  hasMinimumRole,
  hasOrganizationPermission,
  isOrganizationOwner,
  OrganizationForbiddenError,
} from "../../src/server/authz/roles";

describe("organization role hierarchy", () => {
  describe("hasMinimumRole", () => {
    it("allows an owner to satisfy every role level", () => {
      expect(
        hasMinimumRole("OWNER", "OWNER"),
      ).toBe(true);

      expect(
        hasMinimumRole("OWNER", "ADMIN"),
      ).toBe(true);

      expect(
        hasMinimumRole("OWNER", "MEMBER"),
      ).toBe(true);
    });

    it("allows an admin to satisfy admin and member levels", () => {
      expect(
        hasMinimumRole("ADMIN", "ADMIN"),
      ).toBe(true);

      expect(
        hasMinimumRole("ADMIN", "MEMBER"),
      ).toBe(true);

      expect(
        hasMinimumRole("ADMIN", "OWNER"),
      ).toBe(false);
    });

    it("allows a member to satisfy only the member level", () => {
      expect(
        hasMinimumRole("MEMBER", "MEMBER"),
      ).toBe(true);

      expect(
        hasMinimumRole("MEMBER", "ADMIN"),
      ).toBe(false);

      expect(
        hasMinimumRole("MEMBER", "OWNER"),
      ).toBe(false);
    });
  });

  describe("hasOrganizationPermission", () => {
    it("allows every member to view the organization", () => {
      expect(
        hasOrganizationPermission(
          "MEMBER",
          "VIEW_ORGANIZATION",
        ),
      ).toBe(true);

      expect(
        hasOrganizationPermission(
          "ADMIN",
          "VIEW_ORGANIZATION",
        ),
      ).toBe(true);

      expect(
        hasOrganizationPermission(
          "OWNER",
          "VIEW_ORGANIZATION",
        ),
      ).toBe(true);
    });

    it("allows every member to create a booking", () => {
      expect(
        hasOrganizationPermission(
          "MEMBER",
          "CREATE_BOOKING",
        ),
      ).toBe(true);
    });

    it("prevents members from managing resources", () => {
      expect(
        hasOrganizationPermission(
          "MEMBER",
          "MANAGE_RESOURCES",
        ),
      ).toBe(false);
    });

    it("allows admins and owners to manage resources", () => {
      expect(
        hasOrganizationPermission(
          "ADMIN",
          "MANAGE_RESOURCES",
        ),
      ).toBe(true);

      expect(
        hasOrganizationPermission(
          "OWNER",
          "MANAGE_RESOURCES",
        ),
      ).toBe(true);
    });

    it("allows admins and owners to manage members", () => {
      expect(
        hasOrganizationPermission(
          "ADMIN",
          "MANAGE_MEMBERS",
        ),
      ).toBe(true);

      expect(
        hasOrganizationPermission(
          "OWNER",
          "MANAGE_MEMBERS",
        ),
      ).toBe(true);

      expect(
        hasOrganizationPermission(
          "MEMBER",
          "MANAGE_MEMBERS",
        ),
      ).toBe(false);
    });

    it("allows only owners to manage the organization", () => {
      expect(
        hasOrganizationPermission(
          "OWNER",
          "MANAGE_ORGANIZATION",
        ),
      ).toBe(true);

      expect(
        hasOrganizationPermission(
          "ADMIN",
          "MANAGE_ORGANIZATION",
        ),
      ).toBe(false);

      expect(
        hasOrganizationPermission(
          "MEMBER",
          "MANAGE_ORGANIZATION",
        ),
      ).toBe(false);
    });

    it("allows only owners to delete an organization", () => {
      expect(
        hasOrganizationPermission(
          "OWNER",
          "DELETE_ORGANIZATION",
        ),
      ).toBe(true);

      expect(
        hasOrganizationPermission(
          "ADMIN",
          "DELETE_ORGANIZATION",
        ),
      ).toBe(false);
    });

    it("allows only owners to transfer ownership", () => {
      expect(
        hasOrganizationPermission(
          "OWNER",
          "TRANSFER_OWNERSHIP",
        ),
      ).toBe(true);

      expect(
        hasOrganizationPermission(
          "ADMIN",
          "TRANSFER_OWNERSHIP",
        ),
      ).toBe(false);
    });
  });

  describe("assertMinimumRole", () => {
    it("does not throw when the role is sufficient", () => {
      expect(() => {
        assertMinimumRole("OWNER", "ADMIN");
      }).not.toThrow();

      expect(() => {
        assertMinimumRole("ADMIN", "MEMBER");
      }).not.toThrow();
    });

    it("throws OrganizationForbiddenError when the role is insufficient", () => {
      expect(() => {
        assertMinimumRole("MEMBER", "ADMIN");
      }).toThrow(OrganizationForbiddenError);
    });
  });

  describe("assertOrganizationPermission", () => {
    it("does not throw when permission is granted", () => {
      expect(() => {
        assertOrganizationPermission(
          "ADMIN",
          "MANAGE_RESOURCES",
        );
      }).not.toThrow();
    });

    it("throws OrganizationForbiddenError when permission is denied", () => {
      expect(() => {
        assertOrganizationPermission(
          "MEMBER",
          "MANAGE_MEMBERS",
        );
      }).toThrow(OrganizationForbiddenError);
    });

    it("returns a safe authorization error", () => {
      try {
        assertOrganizationPermission(
          "ADMIN",
          "MANAGE_ORGANIZATION",
        );

        throw new Error(
          "Expected authorization to fail.",
        );
      } catch (error) {
        expect(error).toBeInstanceOf(
          OrganizationForbiddenError,
        );

        expect(error).toMatchObject({
          name: "OrganizationForbiddenError",
          code: "ORGANIZATION_FORBIDDEN",
        });
      }
    });
  });

  describe("isOrganizationOwner", () => {
    it("returns true only for the owner role", () => {
      expect(
        isOrganizationOwner("OWNER"),
      ).toBe(true);

      expect(
        isOrganizationOwner("ADMIN"),
      ).toBe(false);

      expect(
        isOrganizationOwner("MEMBER"),
      ).toBe(false);
    });
  });
});