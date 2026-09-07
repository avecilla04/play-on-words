"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type ActionResult = {
  success: boolean;
  message: string;
};

type UpdateWordInput = {
  wordId: string;
  english: string;
  translations: string[];
  categoryIds: string[];
  newCategory?: string;
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

function uniqueTexts(values: string[]) {
  const result = new Map<string, string>();

  for (const value of values) {
    const trimmed = value.trim();

    if (!trimmed) continue;

    const key = normalizeText(trimmed);

    if (!result.has(key)) {
      result.set(key, trimmed);
    }
  }

  return Array.from(result.values());
}

export async function deleteWord(
  wordId: string
): Promise<ActionResult> {
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

  const { error } = await supabase
    .from("words")
    .delete()
    .eq("id", wordId)
    .eq("user_id", user.id);

  if (error) {
    console.error(error);

    return {
      success: false,
      message: "No se pudo eliminar la palabra.",
    };
  }

  revalidatePath("/protected");
  revalidatePath("/protected/vocabulary");
  revalidatePath("/protected/add-word");
  revalidatePath("/protected/categories");

  return {
    success: true,
    message: "Palabra eliminada correctamente.",
  };
}

export async function updateWord(
  input: UpdateWordInput
): Promise<ActionResult> {
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
  const translations = uniqueTexts(input.translations);

  if (!english) {
    return {
      success: false,
      message: "Introduce la palabra en inglés.",
    };
  }

  if (translations.length === 0) {
    return {
      success: false,
      message: "Debe existir al menos una traducción.",
    };
  }

  // --------------------------------------------
  // Comprobar que la palabra pertenece al usuario
  // --------------------------------------------

  const { data: existingWord, error: wordReadError } =
    await supabase
      .from("words")
      .select("id")
      .eq("id", input.wordId)
      .eq("user_id", user.id)
      .maybeSingle();

  if (wordReadError || !existingWord) {
    return {
      success: false,
      message: "No se encontró la palabra.",
    };
  }

  // --------------------------------------------
  // Actualizar inglés
  // --------------------------------------------

  const { error: wordUpdateError } = await supabase
    .from("words")
    .update({
      english,
    })
    .eq("id", input.wordId)
    .eq("user_id", user.id);

  if (wordUpdateError) {
    if (wordUpdateError.code === "23505") {
      return {
        success: false,
        message: `La palabra "${english}" ya existe en tu vocabulario.`,
      };
    }

    console.error(wordUpdateError);

    return {
      success: false,
      message: "No se pudo actualizar la palabra.",
    };
  }

  // --------------------------------------------
  // Sincronizar traducciones
  // --------------------------------------------

  const { data: existingTranslations, error: translationsReadError } =
    await supabase
      .from("word_translations")
      .select("id, spanish, spanish_key")
      .eq("word_id", input.wordId)
      .eq("user_id", user.id);

  if (translationsReadError) {
    console.error(translationsReadError);

    return {
      success: false,
      message: "No se pudieron leer las traducciones.",
    };
  }

  const desiredTranslations = new Map<string, string>();

  for (const translation of translations) {
    desiredTranslations.set(
      normalizeText(translation),
      translation
    );
  }

  const existingTranslationKeys = new Set(
    (existingTranslations ?? []).map(
      (translation) => translation.spanish_key
    )
  );

  // Eliminar las que ya no existen

  const translationsToDelete =
    (existingTranslations ?? [])
      .filter(
        (translation) =>
          !desiredTranslations.has(translation.spanish_key)
      )
      .map((translation) => translation.id);

  if (translationsToDelete.length > 0) {
    const { error } = await supabase
      .from("word_translations")
      .delete()
      .in("id", translationsToDelete)
      .eq("user_id", user.id);

    if (error) {
      console.error(error);

      return {
        success: false,
        message: "No se pudieron actualizar las traducciones.",
      };
    }
  }

  // Actualizar escritura de traducciones existentes
  // Ejemplo: camion -> camión

  for (const translation of existingTranslations ?? []) {
    const desiredText = desiredTranslations.get(
      translation.spanish_key
    );

    if (
      desiredText &&
      desiredText !== translation.spanish
    ) {
      const { error } = await supabase
        .from("word_translations")
        .update({
          spanish: desiredText,
        })
        .eq("id", translation.id)
        .eq("user_id", user.id);

      if (error) {
        console.error(error);
      }
    }
  }

  // Insertar traducciones nuevas

  const translationsToInsert = translations.filter(
    (translation) =>
      !existingTranslationKeys.has(
        normalizeText(translation)
      )
  );

  if (translationsToInsert.length > 0) {
    const { error } = await supabase
      .from("word_translations")
      .insert(
        translationsToInsert.map((spanish) => ({
          user_id: user.id,
          word_id: input.wordId,
          spanish,
        }))
      );

    if (error) {
      console.error(error);

      return {
        success: false,
        message: "No se pudieron añadir las nuevas traducciones.",
      };
    }
  }

  // --------------------------------------------
  // Categorías
  // --------------------------------------------

  const categoryIds = new Set(input.categoryIds);

  const newCategory = input.newCategory?.trim();

  if (newCategory) {
    const categoryKey = normalizeText(newCategory);

    const { data: existingCategory } = await supabase
      .from("categories")
      .select("id")
      .eq("name_key", categoryKey)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingCategory) {
      categoryIds.add(existingCategory.id);
    } else {
      const { data: createdCategory, error } =
        await supabase
          .from("categories")
          .insert({
            user_id: user.id,
            name: newCategory,
          })
          .select("id")
          .single();

      if (error) {
        console.error(error);

        return {
          success: false,
          message: "No se pudo crear la categoría.",
        };
      }

      if (createdCategory) {
        categoryIds.add(createdCategory.id);
      }
    }
  }

  const { data: currentCategoryLinks, error: linksReadError } =
    await supabase
      .from("word_categories")
      .select("category_id")
      .eq("word_id", input.wordId)
      .eq("user_id", user.id);

  if (linksReadError) {
    console.error(linksReadError);

    return {
      success: false,
      message: "No se pudieron actualizar las categorías.",
    };
  }

  const currentCategoryIds = new Set(
    (currentCategoryLinks ?? []).map(
      (link) => link.category_id
    )
  );

  const categoryIdsToRemove = Array.from(
    currentCategoryIds
  ).filter((id) => !categoryIds.has(id));

  const categoryIdsToAdd = Array.from(
    categoryIds
  ).filter((id) => !currentCategoryIds.has(id));

  // Quitar categorías

  if (categoryIdsToRemove.length > 0) {
    const { error } = await supabase
      .from("word_categories")
      .delete()
      .eq("word_id", input.wordId)
      .eq("user_id", user.id)
      .in("category_id", categoryIdsToRemove);

    if (error) {
      console.error(error);
    }
  }

  // Añadir categorías

  if (categoryIdsToAdd.length > 0) {
    const { error } = await supabase
      .from("word_categories")
      .insert(
        categoryIdsToAdd.map((categoryId) => ({
          user_id: user.id,
          word_id: input.wordId,
          category_id: categoryId,
        }))
      );

    if (error) {
      console.error(error);

      return {
        success: false,
        message: "No se pudieron asignar las categorías.",
      };
    }
  }

  revalidatePath("/protected");
  revalidatePath("/protected/vocabulary");
  revalidatePath("/protected/add-word");
  revalidatePath("/protected/categories");

  return {
    success: true,
    message: `"${english}" se ha actualizado correctamente.`,
  };
}