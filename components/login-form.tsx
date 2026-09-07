"use client";

import Link from "next/link";
import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

function translateAuthError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "El correo electrónico o la contraseña no son correctos.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Debes confirmar tu correo electrónico antes de iniciar sesión.";
  }

  if (normalized.includes("too many requests")) {
    return "Demasiados intentos. Espera unos minutos y vuelve a intentarlo.";
  }

  return "No se ha podido iniciar sesión. Comprueba tus datos.";
}

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");

    if (!email.trim() || !password) {
      setErrorMessage(
        "Introduce tu correo electrónico y tu contraseña."
      );
      return;
    }

    startTransition(async () => {
      const supabase = createClient();

      const { error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) {
        setErrorMessage(
          translateAuthError(error.message)
        );
        return;
      }

      router.push("/protected");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* Email */}

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Correo electrónico
        </label>

        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          placeholder="tu@email.com"
          autoComplete="email"
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5"
        />
      </div>

      {/* Contraseña */}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-sm font-semibold text-slate-700"
          >
            Contraseña
          </label>

          <Link
            href="/auth/forgot-password"
            className="text-xs font-medium text-slate-500 hover:text-slate-900"
          >
            ¿Has olvidado tu contraseña?
          </Link>
        </div>

        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          autoComplete="current-password"
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5"
        />
      </div>

      {/* Error */}

      {errorMessage && (
        <div className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">
          ✕ {errorMessage}
        </div>
      )}

      {/* Login */}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-2xl bg-slate-900 px-5 py-4 font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
      >
        {isPending
          ? "Iniciando sesión..."
          : "INICIAR SESIÓN"}
      </button>

      {/* Registro */}

      <p className="text-center text-sm text-slate-500">
        ¿Todavía no tienes una cuenta?{" "}
        <Link
          href="/auth/sign-up"
          className="font-semibold text-slate-900 hover:underline"
        >
          Crear cuenta
        </Link>
      </p>
    </form>
  );
}