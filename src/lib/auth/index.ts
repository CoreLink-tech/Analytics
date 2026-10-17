import { assertAuthSecretConfigured } from "@/lib/security/env";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { authConfig } from "@/lib/auth/config";
import {
  findUserByEmail,
  findUserById,
  verifyPassword,
} from "@/lib/auth/users";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

assertAuthSecretConfigured();

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const user = await findUserByEmail(parsed.data.email);
        if (!user) {
          return null;
        }

        const valid = await verifyPassword(user, parsed.data.password);
        if (!valid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        if (token.email) session.user.email = token.email as string;
        if (token.name) session.user.name = token.name as string;

        const stored = await findUserById(token.sub);
        if (stored) {
          session.user.email = stored.email;
          session.user.name = stored.name;
        }
      }
      return session;
    },
  },
});
