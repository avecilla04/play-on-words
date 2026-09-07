import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8">
      <div className="mx-auto max-w-md">

        {/* Cabecera */}

        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/icon-192.png"
                alt="Play on Words"
                width={52}
                height={52}
                className="rounded-2xl"
                priority
              />

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Play on Words
                </h1>

                <p className="text-sm text-slate-500">
                  Practica tu vocabulario
                </p>
              </div>
            </div>

            <form action={signOut}>
              <button
                type="submit"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-100"
              >
                Salir
              </button>
            </form>
          </div>
        </header>

        {/* Mensaje */}

        <section className="mb-7 rounded-3xl bg-slate-900 p-6 text-white shadow-sm">
          <p className="text-sm font-medium text-slate-300">
            Tu vocabulario
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            ¿Preparado para practicar?
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Practica toda tu bolsa de palabras o selecciona una categoría.
          </p>

          <Link
            href="/protected/play"
            className="mt-6 block rounded-2xl bg-white px-5 py-4 text-center text-base font-bold text-slate-900 transition hover:bg-slate-100"
          >
            ▶ JUGAR
          </Link>
        </section>

        {/* Gestión del vocabulario */}

        <div className="space-y-3">
          <Link
            href="/protected/add-word"
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:bg-slate-50"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl">
              ＋
            </div>

            <div>
              <p className="font-semibold text-slate-900">
                Añadir palabra
              </p>

              <p className="mt-0.5 text-sm text-slate-500">
                Amplía tu bolsa de vocabulario
              </p>
            </div>
          </Link>

          <Link
            href="/protected/vocabulary"
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:bg-slate-50"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl">
              
            </div>

            <div>
              <p className="font-semibold text-slate-900">
                Mi vocabulario
              </p>

              <p className="mt-0.5 text-sm text-slate-500">
                Consulta, edita o elimina palabras
              </p>
            </div>
          </Link>

          <Link
            href="/protected/categories"
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:bg-slate-50"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl">
              🏷
            </div>

            <div>
              <p className="font-semibold text-slate-900">
                Categorías
              </p>

              <p className="mt-0.5 text-sm text-slate-500">
                Organiza tus palabras por temas
              </p>
            </div>
          </Link>
        </div>

        {/* Usuario */}

        <footer className="mt-10 text-center">
          <p className="text-xs text-slate-400">
            Sesión iniciada como
          </p>

          <p className="mt-1 text-xs font-medium text-slate-500">
            {user.email}
          </p>
        </footer>

      </div>
    </main>
  );
}