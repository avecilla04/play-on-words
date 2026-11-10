import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import DailyStreak from "./daily-streak";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { signOut } from "./actions";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const user = await getAuthUser(supabase);

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <main className="app-shell bg-slate-50">
      <div className="mx-auto w-full max-w-md">

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

        <section className="mb-5 rounded-3xl bg-slate-900 p-5 sm:p-6 text-white shadow-sm">
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
            className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-base font-bold text-slate-900 transition hover:bg-slate-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M7 4v16l13 -8z" />
            </svg>
            JUGAR
          </Link>
        </section>

        {/* Racha diaria + recordatorio */}

        <DailyStreak />

        {/* Gestión del vocabulario */}

        <div className="space-y-4">

          <Link
            href="/protected/add-word"
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:bg-slate-50"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 5l0 14" />
                <path d="M5 12l14 0" />
              </svg>
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
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
                <path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
                <path d="M3 6l0 13" />
                <path d="M12 6l0 13" />
                <path d="M21 6l0 13" />
              </svg>
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
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 32 32"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M6.76,6l.45.89L7.76,8H12v5H4V6H6.76m.62-2H3A1,1,0,0,0,2,5v9a1,1,0,0,0,1,1H13a1,1,0,0,0,1-1V7a1,1,0,0,0-1-1H9L8.28,4.55A1,1,0,0,0,7.38,4Z" />
                <path d="M22.76,6l.45.89L23.76,8H28v5H20V6h2.76m.62-2H19a1,1,0,0,0-1,1v9a1,1,0,0,0,1,1H29a1,1,0,0,0,1-1V7a1,1,0,0,0-1-1H25l-.72-1.45a1,1,0,0,0-.9-.55Z" />
                <path d="M6.76,19l.45.89L7.76,21H12v5H4V19H6.76m.62-2H3a1,1,0,0,0-1,1v9a1,1,0,0,0,1,1H13a1,1,0,0,0,1-1V20a1,1,0,0,0-1-1H9l-.72-1.45a1,1,0,0,0-.9-.55Z" />
                <path d="M22.76,19l.45.89L23.76,21H28v5H20V19h2.76m.62-2H19a1,1,0,0,0-1,1v9a1,1,0,0,0,1,1H29a1,1,0,0,0,1-1V20a1,1,0,0,0-1-1H25l-.72-1.45a1,1,0,0,0-.9-.55Z" />
              </svg>
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
