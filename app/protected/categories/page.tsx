import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import CategoriesClient from "./categories-client";

type Category = {
  id: string;
  name: string;
};

type CategoryLink = {
  category_id: string;
};

export default async function CategoriesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, name")
    .eq("user_id", user.id)
    .order("name");

  const { data: linksData } = await supabase
    .from("word_categories")
    .select("category_id")
    .eq("user_id", user.id);

  const categories =
    (categoriesData as Category[] | null) ?? [];

  const links =
    (linksData as CategoryLink[] | null) ?? [];

  const counts = new Map<string, number>();

  for (const link of links) {
    counts.set(
      link.category_id,
      (counts.get(link.category_id) ?? 0) + 1
    );
  }

  const categoriesWithCount = categories.map(
    (category) => ({
      ...category,
      wordCount: counts.get(category.id) ?? 0,
    })
  );

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
            Categorías
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Organiza tu vocabulario por temas.
          </p>
        </header>

        <CategoriesClient
          categories={categoriesWithCount}
        />
      </div>
    </main>
  );
}