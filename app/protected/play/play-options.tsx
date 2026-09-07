"use client";

import {
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { startGame } from "./actions";

type Category = {
  id: string;
  name: string;
};

type Direction =
  | "en_to_es"
  | "es_to_en";

export default function PlayOptions({
  categories,
  totalWords,
}: {
  categories: Category[];
  totalWords: number;
}) {
  const router = useRouter();

  const [direction, setDirection] =
    useState<Direction | null>(null);

  const [scope, setScope] =
    useState<"all" | "category">("all");

  const [categoryId, setCategoryId] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [isPending, startTransition] =
    useTransition();

  function handleStart() {
    setMessage("");

    if (!direction) {
      setMessage(
        "Selecciona el idioma de las palabras."
      );
      return;
    }

    if (
      scope === "category" &&
      !categoryId
    ) {
      setMessage(
        "Selecciona una categoría."
      );
      return;
    }

    startTransition(async () => {
      const result = await startGame({
        direction,
        categoryId:
          scope === "category"
            ? categoryId
            : null,
      });

      if (
        !result.success ||
        !result.gameId
      ) {
        setMessage(result.message);
        return;
      }

      router.push(
        `/protected/play/game/${result.gameId}`
      );
    });
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          ¿Qué palabras quieres ver?
        </h2>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() =>
              setDirection("es_to_en")
            }
            className={`w-full rounded-2xl border p-5 text-left transition ${
              direction === "es_to_en"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-800"
            }`}
          >
            <div className="text-lg font-bold">
              🇪🇸 Palabras en Español
            </div>

            <div
              className={`mt-1 text-sm ${
                direction === "es_to_en"
                  ? "text-slate-300"
                  : "text-slate-500"
              }`}
            >
              Aparece español y escribes
              la palabra en inglés.
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setDirection("en_to_es")
            }
            className={`w-full rounded-2xl border p-5 text-left transition ${
              direction === "en_to_es"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-800"
            }`}
          >
            <div className="text-lg font-bold">
              🇬🇧 Palabras en Inglés
            </div>

            <div
              className={`mt-1 text-sm ${
                direction === "en_to_es"
                  ? "text-slate-300"
                  : "text-slate-500"
              }`}
            >
              Aparece inglés y escribes
              la traducción en español.
            </div>
          </button>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Vocabulario
        </h2>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() =>
              setScope("all")
            }
            className={`w-full rounded-2xl border p-4 text-left ${
              scope === "all"
                ? "border-slate-900 bg-slate-100"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="font-semibold text-slate-900">
              🌐 Toda la bolsa
            </div>

            <div className="mt-1 text-sm text-slate-500">
              {totalWords}{" "}
              {totalWords === 1
                ? "palabra"
                : "palabras"}
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setScope("category")
            }
            className={`w-full rounded-2xl border p-4 text-left ${
              scope === "category"
                ? "border-slate-900 bg-slate-100"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="font-semibold text-slate-900">
              🏷 Elegir categoría
            </div>
          </button>
        </div>

        {scope === "category" && (
          <div className="mt-4">
            {categories.length === 0 ? (
              <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
                Todavía no tienes
                categorías.
              </p>
            ) : (
              <select
                value={categoryId}
                onChange={(event) =>
                  setCategoryId(
                    event.target.value
                  )
                }
                aria-label="Seleccionar categoría"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-900"
              >
                <option value="">
                  Selecciona una categoría
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  )
                )}
              </select>
            )}
          </div>
        )}
      </section>

      {message && (
        <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
          ✕ {message}
        </div>
      )}

      <button
        type="button"
        onClick={handleStart}
        disabled={isPending}
        className="w-full rounded-2xl bg-slate-900 px-6 py-4 text-lg font-bold text-white disabled:opacity-50"
      >
        {isPending
          ? "Preparando partida..."
          : "EMPEZAR"}
      </button>
    </div>
  );
}