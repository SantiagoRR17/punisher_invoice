import type { NextAuthConfig } from "next-auth";

/**
 * Configuración compatible con el runtime Edge del middleware: no importa
 * bcrypt ni el acceso a MongoDB, solo la lógica de qué rutas requieren sesión.
 */
export const authConfig: NextAuthConfig = {
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = Boolean(auth?.user);
      const isOnLogin = request.nextUrl.pathname.startsWith("/login");

      if (isOnLogin) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/menu", request.nextUrl));
        }
        return true;
      }

      return isLoggedIn;
    },
  },
};
