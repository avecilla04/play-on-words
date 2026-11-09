import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient, getAuthUser } from "@/lib/supabase/server";
import { fetchAll } from "@/lib/supabase/fetch-all";
import {
  B2_PACK,
  B2_PACK_INFO,
} from "@/lib/vocabulary-pack/b2-pack";
import PacksClient from "./packs-client";

// La importación completa puede tardar unos segundos.
export const maxDuration = 60;

export default async function PacksPage() {
  const supabase = await createClient();

  const user = await getAuthUser(supabase);

  if (!user) {
    redirect("/auth/login");
  }

  const words = await fetchAll<{ english: string }>((from, to) =>
    supabase
      .from("words")
      .select("english")
      .eq("user_id", user.id)
      .order("id")
      .range(from, to)
  ).catch(() => []);

  const owned = new Set(
    words.map((word) => word.english.trim().toLowerCase())
  );

  const categories = B2_PACK.map((category) => ({
    name: category.name,
    description: category.description,
    source: category.source,
    total: category.words.length,
    owned: category.words.filter((word) =>
      owned.has(word.english.trim().toLowerCase())
    ).length,
    examples: category.words.slice(0, 4).map((word) => word.english),
  }));

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8">
      <div className="mx-auto max-w-md">
        <Link
          href="/protected"
          className="mb-8 inline-block text-sm font-medium text-slate-500"
        >
          ← Volver
        </Link>

        <header className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">
            Packs de vocabulario
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Añade vocabulario listo para practicar. Podrás editarlo o
            borrarlo después como cualquier otra palabra.
          </p>
        </header>

        <PacksClient
          packName={B2_PACK_INFO.name}
          packDescription={B2_PACK_INFO.description}
          categories={categories}
        />
      </div>
    </main>
  );
}
