"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { importB2Pack } from "./actions";

type PackCategorySummary = {
  name: string;
  description: string;
  source: "aptis" | "b2";
  total: number;
  owned: number;
  examples: string[];
};

export default function PacksClient({
  packName,
  packDescription,
  categories,
}: {
  packName: string;
  packDescription: string;
  categories: PackCategorySummary[];
}) {
  const router = useRouter();

  // Por defecto, todo lo que aún no esté completo.
  const [selected, setSelected] = useState<string[]>(() => {
    const pending = categories
      .filter((category) => category.owned < category.total)
      .map((category) => category.name);

    return pending.length > 0
      ? pending
      : categories.map((category) => category.name);
  });

  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [isPending, startTransition] = useTransition();

  const totals = useMemo(() => {
    const words = categories.reduce((sum, c) => sum + c.total, 0);
    const owned = categories.reduce((sum, c) => sum + c.owned, 0);
    const toAdd = categories
      .filter((c) => selected.includes(c.name))
      .reduce((sum, c) => sum + (c.total - c.owned), 0);

    return { words, owned, toAdd };
  }, [categories, selected]);

  const allSelected = selected.length === categories.length;

  function toggle(name: string) {
    setResult(null);
    setSelected((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name]
    );
  }

  function toggleAll() {
    setResult(null);
    setSelected(allSelected ? [] : categories.map((c) => c.name));
  }

  function handleImport() {
    setResult(null);

    startTransition(async () => {
      const response = await importB2Pack(selected);
      setResult(response);

      if (response.success) {
        router.refresh();
      }
    });
  }

  const groups: { title: string; source: "aptis" | "b2" }[] = [
    { title: "Temas Aptis", source: "aptis" },
    { title: "B2: gramática, expresiones y temas", source: "b2" },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-slate-900 p-5 text-white shadow-sm sm:p-6">
        <p className="text-sm font-medium text-slate-300">Pack</p>

        <h2 className="mt-1 text-2xl font-bold">{packName}</h2>

        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          {packDescription}
        </p>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full bg-white transition-all"
            style={{
              width: `${Math.round((totals.owned / totals.words) * 100)}%`,
            }}
          />
        </div>

        <p className="mt-2 text-xs text-slate-300">
          {totals.owned} de {totals.words} palabras ya en tu vocabulario
        </p>
      </section>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Categorías
        </h3>

        <button
          type="button"
          onClick={toggleAll}
          className="text-sm font-semibold text-slate-700 underline-offset-2 hover:underline"
        >
          {allSelected ? "Quitar todas" : "Seleccionar todas"}
        </button>
      </div>

      {groups.map((group) => (
        <section key={group.source}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
            {group.title}
          </p>

          <div className="space-y-2">
            {categories
              .filter((category) => category.source === group.source)
              .map((category) => {
                const isSelected = selected.includes(category.name);
                const complete = category.owned >= category.total;

                return (
                  <button
                    key={category.name}
                    type="button"
                    onClick={() => toggle(category.name)}
                    aria-pressed={isSelected}
                    className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${
                      isSelected
                        ? "border-slate-900 bg-white shadow-sm"
                        : "border-slate-200 bg-white/60"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs font-bold ${
                        isSelected
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-300 bg-white text-transparent"
                      }`}
                    >
                      ✓
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-900">
                          {category.name}
                        </span>

                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                            complete
                              ? "bg-green-50 text-green-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {complete
                            ? `✓ ${category.total}`
                            : category.owned > 0
                              ? `${category.owned}/${category.total}`
                              : category.total}
                        </span>
                      </span>

                      <span className="mt-0.5 block text-sm text-slate-500">
                        {category.description}
                      </span>

                      <span className="mt-1 block truncate text-xs text-slate-400">
                        {category.examples.join(" · ")}…
                      </span>
                    </span>
                  </button>
                );
              })}
          </div>
        </section>
      ))}

      {result && (
        <div
          className={`rounded-2xl p-4 text-sm font-medium ${
            result.success
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-700"
          }`}
        >
          {result.success ? "✓ " : "✕ "}
          {result.message}

          {result.success && (
            <Link
              href="/protected/play"
              className="mt-3 block rounded-xl bg-green-700 px-4 py-3 text-center font-bold text-white"
            >
              ▶ Practicar ahora
            </Link>
          )}
        </div>
      )}

      <div className="sticky bottom-4">
        <button
          type="button"
          onClick={handleImport}
          disabled={isPending || selected.length === 0}
          className="w-full rounded-2xl bg-slate-900 px-6 py-4 text-lg font-bold text-white shadow-lg disabled:opacity-50"
        >
          {isPending
            ? "Añadiendo palabras…"
            : totals.toAdd > 0
              ? `AÑADIR ${totals.toAdd} PALABRAS`
              : "AÑADIR A MI VOCABULARIO"}
        </button>
      </div>
    </div>
  );
}
