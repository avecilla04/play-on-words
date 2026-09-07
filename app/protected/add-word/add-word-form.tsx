"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addWord } from "./actions";

type Category = {
  id: string;
  name: string;
};

export default function AddWordForm({
  categories,
}: {
  categories: Category[];
}) {
  const router = useRouter();

  const [english, setEnglish] = useState("");
  const [translations, setTranslations] = useState([""]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const [isPending, startTransition] = useTransition();

  function updateTranslation(index: number, value: string) {
    const updated = [...translations];
    updated[index] = value;
    setTranslations(updated);
  }

  function addTranslation() {
    setTranslations([...translations, ""]);
  }

  function removeTranslation(index: number) {
    if (translations.length === 1) return;

    setTranslations(
      translations.filter((_, currentIndex) => currentIndex !== index)
    );
  }

  function toggleCategory(id: string) {
    setSelectedCategories((current) =>
      current.includes(id)
        ? current.filter((categoryId) => categoryId !== id)
        : [...current, id]
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");

    startTransition(async () => {
      const result = await addWord({
        english,
        translations,
        categoryIds: selectedCategories,
        newCategory,
      });

      setSuccess(result.success);
      setMessage(result.message);

      if (result.success) {
        setEnglish("");
        setTranslations([""]);
        setSelectedCategories([]);
        setNewCategory("");

        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Palabra en inglés
        </label>

        <input
          type="text"
          value={english}
          onChange={(event) => setEnglish(event.target.value)}
          placeholder="Ej. house"
          autoComplete="off"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg outline-none transition focus:border-slate-900"
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-700">
            Traducción al español
          </label>
        </div>

        <div className="space-y-3">
          {translations.map((translation, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={translation}
                onChange={(event) =>
                  updateTranslation(index, event.target.value)
                }
                placeholder={
                  index === 0
                    ? "Ej. casa"
                    : "Otra traducción válida"
                }
                autoComplete="off"
                className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900"
              />

              {translations.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTranslation(index)}
                  className="rounded-xl border border-slate-300 px-4 text-slate-500"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addTranslation}
          className="mt-3 text-sm font-semibold text-slate-600"
        >
          + Añadir otra traducción
        </button>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-slate-700">
          Categorías
        </p>

        {categories.length === 0 ? (
          <p className="text-sm text-slate-400">
            Todavía no tienes categorías.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const selected = selectedCategories.includes(category.id);

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className={
                    selected
                      ? "rounded-full bg-slate-900 px-4 py-2 text-sm text-white"
                      : "rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-600"
                  }
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Crear nueva categoría
        </label>

        <input
          type="text"
          value={newCategory}
          onChange={(event) => setNewCategory(event.target.value)}
          placeholder="Ej. Viajes"
          autoComplete="off"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900"
        />

        <p className="mt-2 text-xs text-slate-400">
          Es opcional. La nueva categoría se asignará también a esta palabra.
        </p>
      </div>

      {message && (
        <div
          className={`rounded-xl p-4 text-sm font-medium ${
            success
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {success ? "✓ " : "✕ "}
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-2xl bg-slate-900 px-6 py-4 text-base font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
      >
        {isPending ? "Guardando..." : "GUARDAR PALABRA"}
      </button>
    </form>
  );
}