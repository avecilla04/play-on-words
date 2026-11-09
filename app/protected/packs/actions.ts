"use server";

import { revalidatePath } from "next/cache";

import { createClient, getAuthUser } from "@/lib/supabase/server";
import { chunk, fetchAll } from "@/lib/supabase/fetch-all";
import {
  B2_PACK,
  mergePackWords,
} from "@/lib/vocabulary-pack/b2-pack";

type ImportResult = {
  success: boolean;
  message: string;
  addedWords?: number;
  existingWords?: number;
  createdCategories?: number;
};

function normalizeKey(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replaceAll("á", "a")
    .replaceAll("é", "e")
    .replaceAll("í", "i")
    .replaceAll("ó", "o")
    .replaceAll("ú", "u")
    .replaceAll("ü", "u")
    .replace(/\s+/g, " ");
}

// ============================================================
// IMPORTAR EL PACK B2
// ============================================================
//
// - Se puede ejecutar varias veces: nunca duplica palabras,
//   traducciones, categorías ni enlaces.
// - Si ya tenías una palabra (p. ej. "apple"), se respeta
//   tal cual y solo se añade a la categoría del pack.
// ============================================================

export async function importB2Pack(
  categoryNames: string[]
): Promise<ImportResult> {
  const supabase = await createClient();

  const user = await getAuthUser(supabase);

  if (!user) {
    return { success: false, message: "Debes iniciar sesión." };
  }

  const selected = B2_PACK.filter((category) =>
    categoryNames.includes(category.name)
  );

  if (selected.length === 0) {
    return {
      success: false,
      message: "Selecciona al menos una categoría.",
    };
  }

  try {
    const packWords = mergePackWords(selected);

    // ------------------------------------------------
    // 1. CATEGORÍAS
    // ------------------------------------------------

    const loadCategories = () =>
      fetchAll<{ id: string; name: string }>((from, to) =>
        supabase
          .from("categories")
          .select("id, name")
          .eq("user_id", user.id)
          .order("id")
          .range(from, to)
      );

    let existingCategories = await loadCategories();

    const categoryIdByKey = new Map(
      existingCategories.map((category) => [
        normalizeKey(category.name),
        category.id,
      ])
    );

    const missingCategories = selected.filter(
      (category) => !categoryIdByKey.has(normalizeKey(category.name))
    );

    if (missingCategories.length > 0) {
      const { error } = await supabase.from("categories").insert(
        missingCategories.map((category) => ({
          user_id: user.id,
          name: category.name,
        }))
      );

      if (error && error.code !== "23505") {
        throw new Error(error.message);
      }

      existingCategories = await loadCategories();

      for (const category of existingCategories) {
        categoryIdByKey.set(normalizeKey(category.name), category.id);
      }
    }

    // ------------------------------------------------
    // 2. PALABRAS
    // ------------------------------------------------

    const loadWords = () =>
      fetchAll<{ id: string; english: string }>((from, to) =>
        supabase
          .from("words")
          .select("id, english")
          .eq("user_id", user.id)
          .order("id")
          .range(from, to)
      );

    const existingWords = await loadWords();

    const wordIdByKey = new Map(
      existingWords.map((word) => [normalizeKey(word.english), word.id])
    );

    const newWords = packWords.filter(
      (word) => !wordIdByKey.has(normalizeKey(word.english))
    );

    const createdWordIds = new Set<string>();

    for (const group of chunk(newWords, 250)) {
      const { data, error } = await supabase
        .from("words")
        .insert(
          group.map((word) => ({
            user_id: user.id,
            english: word.english,
          }))
        )
        .select("id, english");

      if (!error && data) {
        for (const row of data) {
          wordIdByKey.set(normalizeKey(row.english), row.id);
          createdWordIds.add(row.id);
        }
        continue;
      }

      // Si un bloque falla (por ejemplo, porque la BD considera
      // duplicada alguna palabra), las insertamos una a una.
      for (const word of group) {
        const { data: row, error: rowError } = await supabase
          .from("words")
          .insert({ user_id: user.id, english: word.english })
          .select("id, english")
          .single();

        if (row && !rowError) {
          wordIdByKey.set(normalizeKey(row.english), row.id);
          createdWordIds.add(row.id);
        }
      }
    }

    // ------------------------------------------------
    // 3. TRADUCCIONES (solo para palabras nuevas)
    // ------------------------------------------------

    const translationRows: {
      user_id: string;
      word_id: string;
      spanish: string;
    }[] = [];

    for (const word of newWords) {
      const wordId = wordIdByKey.get(normalizeKey(word.english));

      if (!wordId || !createdWordIds.has(wordId)) {
        continue;
      }

      const unique = new Map<string, string>();

      for (const translation of word.translations) {
        const key = normalizeKey(translation);
        if (!unique.has(key)) unique.set(key, translation);
      }

      for (const spanish of unique.values()) {
        translationRows.push({ user_id: user.id, word_id: wordId, spanish });
      }
    }

    for (const group of chunk(translationRows, 500)) {
      const { error } = await supabase
        .from("word_translations")
        .insert(group);

      if (error) {
        throw new Error(error.message);
      }
    }

    // ------------------------------------------------
    // 4. ENLACES PALABRA ↔ CATEGORÍA
    // ------------------------------------------------

    const packCategoryIds = selected
      .map((category) => categoryIdByKey.get(normalizeKey(category.name)))
      .filter((id): id is string => Boolean(id));

    if (packCategoryIds.length === 0) {
      throw new Error("No se pudieron crear las categorías del pack.");
    }

    const existingLinks = await fetchAll<{
      word_id: string;
      category_id: string;
    }>((from, to) =>
      supabase
        .from("word_categories")
        .select("word_id, category_id")
        .eq("user_id", user.id)
        .in("category_id", packCategoryIds)
        .order("word_id")
        .range(from, to)
    );

    const linkKeys = new Set(
      existingLinks.map((link) => `${link.word_id}:${link.category_id}`)
    );

    const linkRows: {
      user_id: string;
      word_id: string;
      category_id: string;
    }[] = [];

    for (const word of packWords) {
      const wordId = wordIdByKey.get(normalizeKey(word.english));
      if (!wordId) continue;

      for (const categoryName of word.categories) {
        const categoryId = categoryIdByKey.get(normalizeKey(categoryName));
        if (!categoryId) continue;

        const key = `${wordId}:${categoryId}`;
        if (linkKeys.has(key)) continue;

        linkKeys.add(key);
        linkRows.push({
          user_id: user.id,
          word_id: wordId,
          category_id: categoryId,
        });
      }
    }

    for (const group of chunk(linkRows, 500)) {
      const { error } = await supabase.from("word_categories").insert(group);

      if (error) {
        throw new Error(error.message);
      }
    }

    revalidatePath("/protected", "layout");

    const added = createdWordIds.size;
    const already = packWords.length - added;

    return {
      success: true,
      message:
        added > 0
          ? `¡Listo! Se han añadido ${added} palabras nuevas a tu vocabulario.`
          : "Ya tenías todas estas palabras. Se han revisado sus categorías.",
      addedWords: added,
      existingWords: already,
      createdCategories: missingCategories.length,
    };
  } catch (error) {
    console.error("Error importando el pack B2:", error);

    return {
      success: false,
      message:
        "No se pudo completar la importación. Vuelve a pulsar el botón: lo que ya se haya importado no se duplicará.",
    };
  }
}
