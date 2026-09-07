"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type AddWordInput = {
  english: string;
  translations: string[];
  categoryIds: string[];
  newCategory?: string;
};

type AddWordResult = {
  success: boolean;
  message: string;
};

function normalizeText(text: string) {
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

export async function addWord(
  input: AddWordInput
): Promise<AddWordResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Debes iniciar sesión.",
    };
  }

  const english = input.english.trim();

  const translations = Array.from(
    new Map(
      input.translations
        .map((translation) => translation.trim())
        .filter(Boolean)
        .map((translation) => [
          normalizeText(translation),
          translation,
        ])
    ).values()
  );

  if (!english) {
    return {
      success: false,
      message: "Introduce la palabra en inglés.",
    };
  }

  if (translations.length === 0) {
    return {
      success: false,
      message: "Introduce al menos una traducción.",
    };
  }

  // ------------------------------------------------
  // Crear palabra
  // ------------------------------------------------

  const { data: word, error: wordError } = await supabase
    .from("words")
    .insert({
      user_id: user.id,
      english,
    })
    .select("id")
    .single();

  if (wordError) {
    if (wordError.code === "23505") {
      return {
        success: false,
        message: `La palabra "${english}" ya existe en tu vocabulario.`,
      };
    }

    console.error(wordError);

    return {
      success: false,
      message: "No se pudo guardar la palabra.",
    };
  }

  // ------------------------------------------------
  // Crear traducciones
  // ------------------------------------------------

  const { error: translationsError } = await supabase
    .from("word_translations")
    .insert(
      translations.map((spanish) => ({
        user_id: user.id,
        word_id: word.id,
        spanish,
      }))
    );

  if (translationsError) {
    console.error(translationsError);

    await supabase.from("words").delete().eq("id", word.id);

    return {
      success: false,
      message: "No se pudieron guardar las traducciones.",
    };
  }

  // ------------------------------------------------
  // Categorías seleccionadas
  // ------------------------------------------------

  let categoryIds = [...input.categoryIds];

  // ------------------------------------------------
  // Crear una categoría nueva si existe
  // ------------------------------------------------

  const newCategory = input.newCategory?.trim();

  if (newCategory) {
    const categoryKey = normalizeText(newCategory);

    const { data: existingCategory } = await supabase
      .from("categories")
      .select("id")
      .eq("name_key", categoryKey)
      .maybeSingle();

    if (existingCategory) {
      categoryIds.push(existingCategory.id);
    } else {
      const { data: createdCategory, error: categoryError } =
        await supabase
          .from("categories")
          .insert({
            user_id: user.id,
            name: newCategory,
          })
          .select("id")
          .single();

      if (!categoryError && createdCategory) {
        categoryIds.push(createdCategory.id);
      }
    }
  }

  // Evitar categorías duplicadas

  categoryIds = Array.from(new Set(categoryIds));

  // ------------------------------------------------
  // Relacionar palabra y categorías
  // ------------------------------------------------

  if (categoryIds.length > 0) {
    const { error: categoriesError } = await supabase
      .from("word_categories")
      .insert(
        categoryIds.map((categoryId) => ({
          user_id: user.id,
          word_id: word.id,
          category_id: categoryId,
        }))
      );

    if (categoriesError) {
      console.error(categoriesError);
    }
  }

  revalidatePath("/protected");
  revalidatePath("/protected/add-word");
  revalidatePath("/protected/vocabulary");
  revalidatePath("/protected/categories");

  return {
    success: true,
    message: `"${english}" se ha añadido correctamente.`,
  };
}