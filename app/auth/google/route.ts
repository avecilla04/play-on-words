import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();

  const origin = new URL(request.url).origin;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=/protected`,
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(
      `${origin}/auth/error?message=${encodeURIComponent(
        error?.message ?? "No se pudo iniciar sesión con Google"
      )}`
    );
  }

  return NextResponse.redirect(data.url);
}