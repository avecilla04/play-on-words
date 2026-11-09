import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have proxy refreshing
            // user sessions.
          }
        },
      },
    },
  );
}

// ============================================================
// USUARIO ACTUAL (RÁPIDO)
// ============================================================
//
// getUser() hace una petición a los servidores de Supabase
// en cada llamada. getClaims() valida el token de la sesión
// directamente en el servidor de la app (sin ese viaje extra)
// cuando el proyecto usa las nuevas claves de firma de Supabase.
// El proxy ya refresca la sesión en cada petición.
// ============================================================

export type AuthUser = {
  id: string;
  email: string;
};

export async function getAuthUser(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<AuthUser | null> {
  const { data, error } = await supabase.auth.getClaims();

  const claims = data?.claims;

  if (error || !claims?.sub) {
    return null;
  }

  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : "",
  };
}
