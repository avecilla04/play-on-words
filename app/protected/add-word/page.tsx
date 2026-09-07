import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AddWordForm from "./add-word-form";

export default async function AddWordPage() {
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
            Añadir palabra
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Añade vocabulario a tu bolsa de palabras.
          </p>
        </header>

        <AddWordForm categories={categories ?? []} />
      </div>
    </main>
  );
}