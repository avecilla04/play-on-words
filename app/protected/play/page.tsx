import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PlayOptions from "./play-options";

export default async function PlayPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  const { count } = await supabase
    .from("words")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("user_id", user.id);

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8">
      <div className="mx-auto max-w-md">
        <Link
          href="/protected"
          className="mb-8 inline-block text-sm font-medium text-slate-500"
        >
          ← Volver
        </Link>

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Jugar
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Elige cómo quieres practicar hoy.
          </p>
        </header>

        <PlayOptions
          categories={categories ?? []}
          totalWords={count ?? 0}
        />
      </div>
    </main>
  );
}