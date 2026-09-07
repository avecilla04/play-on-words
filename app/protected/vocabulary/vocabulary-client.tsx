"use client";

import Link from "next/link";
import {
  FormEvent,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  deleteWord,
  updateWord,
} from "./actions";

type Translation = {
  id: string;
  spanish: string;
};

type Category = {
  id: string;
  name: string;
};

type VocabularyWord = {
  id: string;
  english: string;
  translations: Translation[];
  categoryIds: string[];
  categories: Category[];
};

function normalizeSearch(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replaceAll("á", "a")
    .replaceAll("é", "e")
    .replaceAll("í", "i")
    .replaceAll("ó", "o")
    .replaceAll("ú", "u")
    .replaceAll("ü", "u");
}

function speakEnglish(word: string) {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window)
  ) {
    return;
  }

  window.speechSynthesis.cancel();

  const utterance =
    new SpeechSynthesisUtterance(word);

  utterance.lang = "en-GB";
  utterance.rate = 0.9;

  window.speechSynthesis.speak(utterance);
}

export default function VocabularyClient({
  words,
  categories,
}: {
  words: VocabularyWord[];
  categories: Category[];
}) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [editingWord, setEditingWord] =
    useState<VocabularyWord | null>(null);

  const [message, setMessage] = useState("");
  const [messageSuccess, setMessageSuccess] =
    useState(false);

  const [isPending, startTransition] =
    useTransition();

  const filteredWords = useMemo(() => {
    const query = normalizeSearch(search);

    if (!query) {
      return words;
    }

    return words.filter((word) => {
      if (
        normalizeSearch(word.english).includes(query)
      ) {
        return true;
      }

      if (
        word.translations.some((translation) =>
          normalizeSearch(
            translation.spanish
          ).includes(query)
        )
      ) {
        return true;
      }

      if (
        word.categories.some((category) =>
          normalizeSearch(
            category.name
          ).includes(query)
        )
      ) {
        return true;
      }

      return false;
    });
  }, [search, words]);

  function handleDelete(word: VocabularyWord) {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar "${word.english}"?`
    );

    if (!confirmed) return;

    setMessage("");

    startTransition(async () => {
      const result = await deleteWord(word.id);

      setMessage(result.message);
      setMessageSuccess(result.success);

      if (result.success) {
        router.refresh();
      }
    });
  }

  return (
    <>
      <div className="mb-6">
        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Buscar palabra, traducción o categoría..."
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 outline-none transition focus:border-slate-900"
        />

        <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
          <span>
            {words.length}{" "}
            {words.length === 1
              ? "palabra"
              : "palabras"}
          </span>

          {search && (
            <span>
              {filteredWords.length} resultados
            </span>
          )}
        </div>
      </div>

      {message && (
        <div
          className={`mb-5 rounded-xl p-4 text-sm font-medium ${
            messageSuccess
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {messageSuccess ? "✓ " : "✕ "}
          {message}
        </div>
      )}

      {words.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-800">
            Tu bolsa está vacía
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Añade tu primera palabra para empezar.
          </p>

          <Link
            href="/protected/add-word"
            className="mt-6 inline-block rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            + Añadir palabra
          </Link>
        </div>
      ) : filteredWords.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="font-semibold text-slate-700">
            No encontramos resultados
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredWords.map((word) => (
            <article
              key={word.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900">
                      {word.english}
                    </h2>

                    <button
                      type="button"
                      onClick={() =>
                        speakEnglish(word.english)
                      }
                      className="rounded-lg px-2 py-1 text-lg transition hover:bg-slate-100"
                      aria-label={`Escuchar ${word.english}`}
                    >
                      🔊
                    </button>
                  </div>

                  <p className="mt-1 text-slate-600">
                    {word.translations
                      .map(
                        (translation) =>
                          translation.spanish
                      )
                      .join(" · ")}
                  </p>
                </div>
              </div>

              {word.categories.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {word.categories.map(
                    (category) => (
                      <span
                        key={category.id}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                      >
                        {category.name}
                      </span>
                    )
                  )}
                </div>
              )}

              <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    setEditingWord(word)
                  }
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Editar
                </button>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    handleDelete(word)
                  }
                  className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                >
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {editingWord && (
        <EditWordModal
          key={editingWord.id}
          word={editingWord}
          categories={categories}
          onClose={() =>
            setEditingWord(null)
          }
        />
      )}
    </>
  );
}

function EditWordModal({
  word,
  categories,
  onClose,
}: {
  word: VocabularyWord;
  categories: Category[];
  onClose: () => void;
}) {
  const router = useRouter();

  const [english, setEnglish] =
    useState(word.english);

  const [translations, setTranslations] =
    useState(
      word.translations.length > 0
        ? word.translations.map(
            (translation) =>
              translation.spanish
          )
        : [""]
    );

  const [
    selectedCategories,
    setSelectedCategories,
  ] = useState<string[]>(
    word.categoryIds
  );

  const [newCategory, setNewCategory] =
    useState("");

  const [message, setMessage] = useState("");
  const [success, setSuccess] =
    useState(false);

  const [isPending, startTransition] =
    useTransition();

  function updateTranslation(
    index: number,
    value: string
  ) {
    const updated = [...translations];

    updated[index] = value;

    setTranslations(updated);
  }

  function addTranslation() {
    setTranslations([
      ...translations,
      "",
    ]);
  }

  function removeTranslation(index: number) {
    if (translations.length === 1) {
      return;
    }

    setTranslations(
      translations.filter(
        (_, currentIndex) =>
          currentIndex !== index
      )
    );
  }

  function toggleCategory(id: string) {
    setSelectedCategories((current) =>
      current.includes(id)
        ? current.filter(
            (categoryId) =>
              categoryId !== id
          )
        : [...current, id]
    );
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");

    startTransition(async () => {
      const result = await updateWord({
        wordId: word.id,
        english,
        translations,
        categoryIds:
          selectedCategories,
        newCategory,
      });

      setSuccess(result.success);
      setMessage(result.message);

      if (result.success) {
        router.refresh();

        setTimeout(() => {
          onClose();
        }, 500);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-5">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Editar palabra
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Modifica los datos guardados.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-2 text-slate-600"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div>
            <label
                htmlFor="edit-english"
                className="mb-2 block text-sm font-semibold text-slate-700"
            >
                Inglés
            </label>

            <input
                id="edit-english"
                type="text"
                value={english}
                onChange={(event) =>
                    setEnglish(event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <p className="mb-2 block text-sm font-semibold text-slate-700">
              Traducciones
            </p>

            <div className="space-y-3">
              {translations.map(
                (
                  translation,
                  index
                ) => (
                  <div
                    key={index}
                    className="flex gap-2"
                  >
                    <input
                        type="text"
                        value={translation}
                        onChange={(event) =>
                            updateTranslation(index, event.target.value)
                        }
                        aria-label={`Traducción ${index + 1}`}
                        className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                    />

                    {translations.length >
                      1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeTranslation(
                            index
                          )
                        }
                        className="rounded-xl border border-slate-300 px-4 text-slate-500"
                      >
                        ×
                      </button>
                    )}
                  </div>
                )
              )}
            </div>

            <button
              type="button"
              onClick={addTranslation}
              className="mt-3 text-sm font-semibold text-slate-600"
            >
              + Añadir traducción
            </button>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-slate-700">
              Categorías
            </p>

            <div className="flex flex-wrap gap-2">
              {categories.map(
                (category) => {
                  const selected =
                    selectedCategories.includes(
                      category.id
                    );

                  return (
                    <button
                      key={
                        category.id
                      }
                      type="button"
                      onClick={() =>
                        toggleCategory(
                          category.id
                        )
                      }
                      className={
                        selected
                          ? "rounded-full bg-slate-900 px-4 py-2 text-sm text-white"
                          : "rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-600"
                      }
                    >
                      {
                        category.name
                      }
                    </button>
                  );
                }
              )}
            </div>
          </div>

          <div>
            <label
                htmlFor="edit-new-category"
                className="mb-2 block text-sm font-semibold text-slate-700"
            >
                Nueva categoría
            </label>

            <input
                id="edit-new-category"
                type="text"
                value={newCategory}
                onChange={(event) =>
                    setNewCategory(event.target.value)
                }
                placeholder="Opcional"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            />
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

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-50"
            >
              {isPending
                ? "Guardando..."
                : "GUARDAR"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}