import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { fetchAll } from "@/lib/supabase/fetch-all";
import PlayOptions from "./play-options";

export default async function PlayPage() {
  const supabase = await createClient();

  const user = await getAuthUser(supabase);

  if (!user) {
    redirect("/auth/login");
  }

  // Las tres consultas a la vez, no una detrás de otra.
  const [categoriesResult, links, countResult] =
    await Promise.all([
      supabase
        .from("categories")
        .select("id, name")
        .eq("user_id", user.id)
        .order("name"),
      fetchAll<{ category_id: string }>((from, to) =>
        supabase
          .from("word_categories")
          .select("category_id")
          .eq("user_id", user.id)
          .order("category_id")
          .range(from, to)
      ).catch(() => []),
      supabase
        .from("words")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("user_id", user.id),
    ]);

  const categories = categoriesResult.data;
  const count = countResult.count;

  const wordCountByCategory = new Map<string, number>();

  for (const link of links) {
    wordCountByCategory.set(
      link.category_id,
      (wordCountByCategory.get(link.category_id) ?? 0) + 1
    );
  }

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
          categories={(categories ?? []).map((category) => ({
            ...category,
            wordCount:
              wordCountByCategory.get(category.id) ?? 0,
          }))}
          totalWords={count ?? 0}
        />
      </div>
    </main>
  );
}