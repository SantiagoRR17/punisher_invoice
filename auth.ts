import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { verifyCredentials } from "@/services/authService";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      authorize: async (credentials) => {
        const username = credentials?.username;
        const password = credentials?.password;
        if (typeof username !== "string" || typeof password !== "string") {
          return null;
        }

        const user = await verifyCredentials(username, password);
        if (!user) {
          return null;
        }

        return { id: user.id, name: user.username, role: user.role };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string | undefined;
      }
      return session;
    },
  },
});
