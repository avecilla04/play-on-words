"use client";

import {
  FormEvent,
  useState,
  useTransition,
} from "react";

import { useRouter } from "next/navigation";

import {
  createCategory,
  deleteCategory,
  renameCategory,
} from "./actions";

type Category = {
  id: string;
  name: string;
  wordCount: number;
};

export default function CategoriesClient({
  categories,
}: {
  categories: Category[];
}) {
  const router = useRouter();

  const [newCategory, setNewCategory] =
    useState("");

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [editingName, setEditingName] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  const [isPending, startTransition] =
    useTransition();

  function handleCreate(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");

    startTransition(async () => {
      const result =
        await createCategory(newCategory);

      setSuccess(result.success);
      setMessage(result.message);

      if (result.success) {
        setNewCategory("");
        router.refresh();
      }
    });
  }

  function startEditing(category: Category) {
    setEditingId(category.id);
    setEditingName(category.name);
    setMessage("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingName("");
  }

  function handleRename(
    event: FormEvent<HTMLFormElement>,
    categoryId: string
  ) {
    event.preventDefault();

    setMessage("");

    startTransition(async () => {
      const result =
        await renameCategory(
          categoryId,
          editingName
        );

      setSuccess(result.success);
      setMessage(result.message);

      if (result.success) {
        setEditingId(null);
        setEditingName("");
        router.refresh();
      }
    });
  }

  function handleDelete(category: Category) {
    const confirmed = window.confirm(
      `¿Eliminar la categoría "${category.name}"?\n\nLas palabras NO se eliminarán.`
    );

    if (!confirmed) return;

    setMessage("");

    startTransition(async () => {
      const result =
        await deleteCategory(category.id);

      setSuccess(result.success);
      setMessage(result.message);

      if (result.success) {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-7">

      {/* Crear categoría */}

      <form
        onSubmit={handleCreate}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <label
          htmlFor="new-category"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Nueva categoría
        </label>

        <div className="flex gap-2">
          <input
            id="new-category"
            type="text"
            value={newCategory}
            onChange={(event) =>
              setNewCategory(event.target.value)
            }
            placeholder="Ej. Viajes"
            autoComplete="off"
            className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          />

          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white disabled:opacity-50"
          >
            Añadir
          </button>
        </div>
      </form>

      {/* Mensajes */}

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

      {/* Número de categorías */}

      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">
          Mis categorías
        </h2>

        <span className="text-sm text-slate-500">
          {categories.length}{" "}
          {categories.length === 1
            ? "categoría"
            : "categorías"}
        </span>
      </div>

      {/* Sin categorías */}

      {categories.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="text-3xl">
            🏷
          </div>

          <p className="mt-4 font-semibold text-slate-800">
            Todavía no tienes categorías
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Puedes crear categorías como B1,
            Viajes, Verbos o Trabajo.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <article
              key={category.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              {editingId === category.id ? (
                <form
                  onSubmit={(event) =>
                    handleRename(
                      event,
                      category.id
                    )
                  }
                >
                  <label
                    htmlFor={`category-${category.id}`}
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Nombre
                  </label>

                  <input
                    id={`category-${category.id}`}
                    type="text"
                    value={editingName}
                    onChange={(event) =>
                      setEditingName(
                        event.target.value
                      )
                    }
                    autoFocus
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  />

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      disabled={isPending}
                      className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {category.name}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {category.wordCount}{" "}
                        {category.wordCount === 1
                          ? "palabra"
                          : "palabras"}
                      </p>
                    </div>

                    <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
                      {category.wordCount}
                    </div>
                  </div>

                  <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() =>
                        startEditing(category)
                      }
                      className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(category)
                      }
                      disabled={isPending}
                      className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}