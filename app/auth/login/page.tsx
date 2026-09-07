import Link from "next/link";
import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
      <div className="w-full max-w-sm">

        {/* Título de Play on Words */}

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Play on Words
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Practica tu vocabulario cada día
          </p>
        </div>

        {/* Botón Google */}

        <Link
          href="/auth/google"
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-5 py-3.5 font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fill="#4285F4"
              d="M21.35 12.2c0-.74-.07-1.46-.2-2.15H12v4.07h5.23a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.69 2.92-4.19 2.92-7.28Z"
            />
            <path
              fill="#34A853"
              d="M12 21.7c2.63 0 4.84-.87 6.45-2.36l-3.14-2.43c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.51A9.75 9.75 0 0 0 12 21.7Z"
            />
            <path
              fill="#FBBC05"
              d="M6.54 13.8A5.86 5.86 0 0 1 6.23 12c0-.62.11-1.23.31-1.8V7.69H3.3A9.72 9.72 0 0 0 2.25 12c0 1.56.37 3.03 1.05 4.31l3.24-2.51Z"
            />
            <path
              fill="#EA4335"
              d="M12 6.17c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.26 14.63 2.3 12 2.3a9.75 9.75 0 0 0-8.7 5.39l3.24 2.51C7.31 7.89 9.46 6.17 12 6.17Z"
            />
          </svg>

          Continuar con Google
        </Link>

        {/* Separador */}

        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-200" />

          <span className="text-xs font-medium uppercase text-slate-400">
            o
          </span>

          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {/* Login email/contraseña */}

        <LoginForm />

      </div>
    </main>
  );
}
