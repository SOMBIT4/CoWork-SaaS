import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "@/auth.config";
import { env } from "@/lib/env";
import { loginSchema } from "@/lib/validation/auth";
import { findUserByEmailForLogin } from "@/server/repositories/user.repository";

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,

  secret: env.AUTH_SECRET,

  providers: [
    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "owner@example.com",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(rawCredentials) {
        const parsed =
          loginSchema.safeParse(rawCredentials);

        if (!parsed.success) {
          return null;
        }

        const user =
          await findUserByEmailForLogin(
            parsed.data.email,
          );

        if (!user?.passwordHash) {
          return null;
        }

        const passwordMatches =
          await bcrypt.compare(
            parsed.data.password,
            user.passwordHash,
          );

        if (!passwordMatches) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.imageUrl,
        };
      },
    }),
  ],

  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id;
      }

      return token;
    },

    session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = String(token.userId);
      }

      return session;
    },
  },
});