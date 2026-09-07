import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">
      <div className="mx-auto max-w-md">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Play on Words
          </h1>

          <p className="mt-2 text-slate-500">
            Your vocabulary, every day.
          </p>
        </header>

        <div className="space-y-4">
          <Link
            href="/protected/play"
            className="block rounded-2xl bg-slate-900 px-6 py-5 text-center text-lg font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            ▶ JUGAR
          </Link>

          <Link
            href="/protected/add-word"
            className="block rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            ＋ Añadir palabra
          </Link>

          <Link
            href="/protected/vocabulary"
            className="block rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            Mi vocabulario
          </Link>

          <Link
            href="/protected/categories"
            className="block rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            🏷 Categorías
          </Link>

        </div>

        <p className="mt-10 text-center text-xs text-slate-400">
          {user.email}
        </p>
      </div>
    </main>
  );
}