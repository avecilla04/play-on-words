"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type ActionResult = {
  success: boolean;
  message: string;
};

export async function createCategory(
  name: string
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

  const cleanName = name.trim();

  if (!cleanName) {
    return {
      success: false,
      message: "Introduce un nombre para la categoría.",
    };
  }

  const { error } = await supabase
    .from("categories")
    .insert({
      user_id: user.id,
      name: cleanName,
    });

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        message: `La categoría "${cleanName}" ya existe.`,
      };
    }

    console.error(error);

    return {
      success: false,
      message: "No se pudo crear la categoría.",
    };
  }

  revalidatePath("/protected/categories");
  revalidatePath("/protected/add-word");
  revalidatePath("/protected/vocabulary");
  revalidatePath("/protected/play");

  return {
    success: true,
    message: `Categoría "${cleanName}" creada.`,
  };
}

export async function renameCategory(
  categoryId: string,
  name: string
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

  const cleanName = name.trim();

  if (!cleanName) {
    return {
      success: false,
      message: "El nombre no puede estar vacío.",
    };
  }

  const { error } = await supabase
    .from("categories")
    .update({
      name: cleanName,
    })
    .eq("id", categoryId)
    .eq("user_id", user.id);

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        message: `La categoría "${cleanName}" ya existe.`,
      };
    }

    console.error(error);

    return {
      success: false,
      message: "No se pudo cambiar el nombre.",
    };
  }

  revalidatePath("/protected/categories");
  revalidatePath("/protected/add-word");
  revalidatePath("/protected/vocabulary");
  revalidatePath("/protected/play");

  return {
    success: true,
    message: `Categoría actualizada a "${cleanName}".`,
  };
}

export async function deleteCategory(
  categoryId: string
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

  const { data: category } = await supabase
    .from("categories")
    .select("name")
    .eq("id", categoryId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!category) {
    return {
      success: false,
      message: "No se encontró la categoría.",
    };
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId)
    .eq("user_id", user.id);

  if (error) {
    console.error(error);

    return {
      success: false,
      message: "No se pudo eliminar la categoría.",
    };
  }

  revalidatePath("/protected/categories");
  revalidatePath("/protected/add-word");
  revalidatePath("/protected/vocabulary");
  revalidatePath("/protected/play");

  return {
    success: true,
    message: `Categoría "${category.name}" eliminada.`,
  };
}