import { z } from "zod";

export const INVITABLE_ROLES = [
  "ADMIN",
  "MEMBER",
] as const;

export const inviteMemberSchema = z.object({
  email: z
    .string()
    .trim()
    .email(
      "Enter a valid email address.",
    )
    .max(
      320,
      "Email cannot exceed 320 characters.",
    )
    .transform((email) =>
      email.toLowerCase(),
    ),

  role: z.enum(
    INVITABLE_ROLES,
  ),
});

export const invitationTokenSchema = z
  .string()
  .min(
    32,
    "Invalid invitation token.",
  )
  .max(
    128,
    "Invalid invitation token.",
  )
  .regex(
    /^[A-Za-z0-9_-]+$/,
    "Invalid invitation token.",
  );

export const membershipIdSchema =
  z.string().uuid();

export const changeMemberRoleSchema =
  z.object({
    role: z.enum(
      INVITABLE_ROLES,
    ),
  });

export type InviteMemberInput =
  z.infer<
    typeof inviteMemberSchema
  >;

export type ChangeMemberRoleInput =
  z.infer<
    typeof changeMemberRoleSchema
  >;