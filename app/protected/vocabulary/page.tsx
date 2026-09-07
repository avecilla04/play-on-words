import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import VocabularyClient from "./vocabulary-client";

type TranslationRow = {
  id: string;
  word_id: string;
  spanish: string;
};

type Category = {
  id: string;
  name: string;
};

type CategoryLink = {
  word_id: string;
  category_id: string;
};

export default async function VocabularyPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: words } = await supabase
    .from("words")
    .select("id, english")
    .order("english");

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  const wordIds = (words ?? []).map(
    (word) => word.id
  );

  let translations: TranslationRow[] = [];
  let categoryLinks: CategoryLink[] = [];

  if (wordIds.length > 0) {
    const { data: translationData } = await supabase
      .from("word_translations")
      .select("id, word_id, spanish")
      .in("word_id", wordIds)
      .order("spanish");

    translations =
      (translationData as TranslationRow[] | null) ?? [];

    const { data: categoryLinkData } = await supabase
      .from("word_categories")
      .select("word_id, category_id")
      .in("word_id", wordIds);

    categoryLinks =
      (categoryLinkData as CategoryLink[] | null) ?? [];
  }

  const categoryList =
    (categories as Category[] | null) ?? [];

  const categoryById = new Map(
    categoryList.map((category) => [
      category.id,
      category,
    ])
  );

  const translationsByWord = new Map<
    string,
    { id: string; spanish: string }[]
  >();

  for (const translation of translations) {
    const current =
      translationsByWord.get(translation.word_id) ?? [];

    current.push({
      id: translation.id,
      spanish: translation.spanish,
    });

    translationsByWord.set(
      translation.word_id,
      current
    );
  }

  const categoryIdsByWord = new Map<
    string,
    string[]
  >();

  for (const link of categoryLinks) {
    const current =
      categoryIdsByWord.get(link.word_id) ?? [];

    current.push(link.category_id);

    categoryIdsByWord.set(link.word_id, current);
  }

  const vocabulary = (words ?? []).map((word) => {
    const categoryIds =
      categoryIdsByWord.get(word.id) ?? [];

    return {
      id: word.id,
      english: word.english,
      translations:
        translationsByWord.get(word.id) ?? [],

      categoryIds,

      categories: categoryIds
        .map((categoryId) =>
          categoryById.get(categoryId)
        )
        .filter(
          (category): category is Category =>
            Boolean(category)
        ),
    };
  });

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/protected"
            className="text-sm font-medium text-slate-500"
          >
            ← Volver
          </Link>

          <Link
            href="/protected/add-word"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            + Añadir
          </Link>
        </div>

        <header className="mb-7">
          <h1 className="text-3xl font-bold text-slate-900">
            Mi vocabulario
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Consulta y administra tu bolsa de palabras.
          </p>
        </header>

        <VocabularyClient
          words={vocabulary}
          categories={categoryList}
        />
      </div>
    </main>
  );
}