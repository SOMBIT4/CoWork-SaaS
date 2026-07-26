import { z } from "zod";

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters.")
    .max(100, "Name cannot exceed 100 characters."),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address.")
    .max(320, "Email cannot exceed 320 characters."),

  password: z
    .string()
    .min(10, "Password must contain at least 10 characters.")
    .max(128, "Password cannot exceed 128 characters.")
    .regex(
      /[a-z]/,
      "Password must contain a lowercase letter.",
    )
    .regex(
      /[A-Z]/,
      "Password must contain an uppercase letter.",
    )
    .regex(
      /[0-9]/,
      "Password must contain a number.",
    ),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address.")
    .max(320, "Email cannot exceed 320 characters."),

  password: z
    .string()
    .min(1, "Password is required.")
    .max(128, "Password cannot exceed 128 characters."),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;