"use server";

import { createClient } from "@/lib/supabase/server";

// ============================================================
// TIPOS
// ============================================================

type Direction = "en_to_es" | "es_to_en";

type StartGameInput = {
  direction: Direction;
  categoryId?: string | null;
};

type StartGameResult = {
  success: boolean;
  message: string;
  gameId?: string;
};

type SaveAnswerInput = {
  gameId: string;
  wordId: string;
  position: number;
  direction: Direction;
  promptText: string;
  userAnswer: string;
  correctAnswers: string[];
  isCorrect: boolean;
};

type SaveAnswerResult = {
  success: boolean;
  message: string;
};

// ============================================================
// CREAR UNA PARTIDA
// ============================================================

export async function startGame(
  input: StartGameInput
): Promise<StartGameResult> {
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

  if (
    input.direction !== "en_to_es" &&
    input.direction !== "es_to_en"
  ) {
    return {
      success: false,
      message: "Dirección de juego no válida.",
    };
  }

  let scope: "all" | "category" = "all";
  let categoryId: string | null = null;
  let categoryName: string | null = null;
  let totalWords = 0;

  // ------------------------------------------------
  // JUGAR POR CATEGORÍA
  // ------------------------------------------------

  if (input.categoryId) {
    scope = "category";
    categoryId = input.categoryId;

    const { data: category, error: categoryError } =
      await supabase
        .from("categories")
        .select("id, name")
        .eq("id", categoryId)
        .eq("user_id", user.id)
        .maybeSingle();

    if (categoryError || !category) {
      return {
        success: false,
        message: "No se encontró la categoría.",
      };
    }

    categoryName = category.name;

    const { data: links, error: linksError } =
      await supabase
        .from("word_categories")
        .select("word_id")
        .eq("user_id", user.id)
        .eq("category_id", categoryId);

    if (linksError) {
      console.error(linksError);

      return {
        success: false,
        message:
          "No se pudieron cargar las palabras de la categoría.",
      };
    }

    totalWords = new Set(
      (links ?? []).map((link) => link.word_id)
    ).size;
  }

  // ------------------------------------------------
  // JUGAR CON TODA LA BOLSA
  // ------------------------------------------------

  else {
    const { count, error } = await supabase
      .from("words")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("user_id", user.id);

    if (error) {
      console.error(error);

      return {
        success: false,
        message:
          "No se pudo consultar tu bolsa de palabras.",
      };
    }

    totalWords = count ?? 0;
  }

  // ------------------------------------------------
  // COMPROBAR QUE HAY PALABRAS
  // ------------------------------------------------

  if (totalWords === 0) {
    return {
      success: false,
      message:
        scope === "category"
          ? "Esta categoría todavía no tiene palabras."
          : "Tu bolsa de palabras está vacía.",
    };
  }

  // ------------------------------------------------
  // GUARDAR PARTIDA
  // ------------------------------------------------

  const { data: game, error: gameError } =
    await supabase
      .from("games")
      .insert({
        user_id: user.id,
        direction: input.direction,
        scope,
        category_id: categoryId,
        category_name: categoryName,
        total_words: totalWords,
        correct_answers: 0,
        incorrect_answers: 0,
        status: "in_progress",
      })
      .select("id")
      .single();

  if (gameError || !game) {
    console.error(gameError);

    return {
      success: false,
      message: "No se pudo iniciar la partida.",
    };
  }

  return {
    success: true,
    message: "Partida creada.",
    gameId: game.id,
  };
}

// ============================================================
// GUARDAR RESPUESTA
// ============================================================
//
// La comprobación CORRECTO / ERROR ya se realiza
// directamente en el dispositivo.
//
// Esta función únicamente guarda el resultado
// en Supabase en segundo plano.
// ============================================================

export async function saveAnswer(
  input: SaveAnswerInput
): Promise<SaveAnswerResult> {
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

  const userAnswer =
    input.userAnswer.trim();

  if (!userAnswer) {
    return {
      success: false,
      message: "La respuesta está vacía.",
    };
  }

  // ------------------------------------------------
  // GUARDAR RESPUESTA
  // ------------------------------------------------
  //
  // game_id + position es UNIQUE en nuestra BD.
  //
  // El upsert evita problemas si por cualquier motivo
  // se intenta guardar dos veces la misma posición.
  // ------------------------------------------------

  const { error } = await supabase
    .from("game_answers")
    .upsert(
      {
        user_id: user.id,
        game_id: input.gameId,
        word_id: input.wordId,
        position: input.position,
        direction: input.direction,
        prompt_text: input.promptText,
        user_answer: userAnswer,
        correct_answers: input.correctAnswers,
        is_correct: input.isCorrect,
      },
      {
        onConflict: "game_id,position",
        ignoreDuplicates: true,
      }
    );

  if (error) {
    console.error(
      "Error guardando respuesta:",
      error
    );

    return {
      success: false,
      message:
        "No se pudo sincronizar la respuesta.",
    };
  }

  return {
    success: true,
    message: "Respuesta guardada.",
  };
}

// ============================================================
// FINALIZAR PARTIDA
// ============================================================

export async function completeGame(
  gameId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
    };
  }

  // ------------------------------------------------
  // LEER TODAS LAS RESPUESTAS UNA SOLA VEZ
  // ------------------------------------------------

  const { data: answers, error: answersError } =
    await supabase
      .from("game_answers")
      .select("is_correct")
      .eq("game_id", gameId)
      .eq("user_id", user.id);

  if (answersError) {
    console.error(answersError);

    return {
      success: false,
    };
  }

  // ------------------------------------------------
  // CALCULAR RESULTADO FINAL
  // ------------------------------------------------

  const correct =
    (answers ?? []).filter(
      (answer) => answer.is_correct
    ).length;

  const incorrect =
    (answers ?? []).filter(
      (answer) => !answer.is_correct
    ).length;

  // ------------------------------------------------
  // GUARDAR RESULTADO FINAL
  // ------------------------------------------------

  const { error } = await supabase
    .from("games")
    .update({
      correct_answers: correct,
      incorrect_answers: incorrect,
      status: "completed",
      completed_at:
        new Date().toISOString(),
    })
    .eq("id", gameId)
    .eq("user_id", user.id);

  if (error) {
    console.error(error);

    return {
      success: false,
    };
  }

  return {
    success: true,
    correct,
    incorrect,
  };
}

// ============================================================
// CREAR PARTIDA DE REPASO DE ERRORES
// ============================================================

export async function startReviewGame(
  sourceGameId: string
): Promise<StartGameResult> {
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

  // ------------------------------------------------
  // OBTENER LA PARTIDA ORIGINAL
  // ------------------------------------------------

  const {
    data: sourceGame,
    error: sourceGameError,
  } = await supabase
    .from("games")
    .select("id, direction")
    .eq("id", sourceGameId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (
    sourceGameError ||
    !sourceGame
  ) {
    return {
      success: false,
      message: "No se encontró la partida.",
    };
  }

  // ------------------------------------------------
  // OBTENER ÚNICAMENTE LAS PALABRAS FALLADAS
  // ------------------------------------------------

  const {
    data: failedAnswers,
    error: failedAnswersError,
  } = await supabase
    .from("game_answers")
    .select("word_id")
    .eq("game_id", sourceGameId)
    .eq("user_id", user.id)
    .eq("is_correct", false)
    .not("word_id", "is", null);

  if (failedAnswersError) {
    console.error(
      failedAnswersError
    );

    return {
      success: false,
      message:
        "No se pudieron cargar los errores.",
    };
  }

  // Evitar palabras repetidas

  const failedWordIds =
    Array.from(
      new Set(
        (failedAnswers ?? [])
          .map(
            (answer) =>
              answer.word_id
          )
          .filter(
            (
              wordId
            ): wordId is string =>
              Boolean(wordId)
          )
      )
    );

  if (
    failedWordIds.length === 0
  ) {
    return {
      success: false,
      message:
        "No tienes errores que repasar.",
    };
  }

  // ------------------------------------------------
  // CREAR NUEVA PARTIDA DE REPASO
  // ------------------------------------------------

  const {
    data: reviewGame,
    error: reviewGameError,
  } = await supabase
    .from("games")
    .insert({
      user_id: user.id,

      direction:
        sourceGame.direction,

      scope: "review_errors",

      source_game_id:
        sourceGameId,

      category_id: null,

      category_name: null,

      total_words:
        failedWordIds.length,

      correct_answers: 0,

      incorrect_answers: 0,

      status: "in_progress",
    })
    .select("id")
    .single();

  if (
    reviewGameError ||
    !reviewGame
  ) {
    console.error(
      reviewGameError
    );

    return {
      success: false,
      message:
        "No se pudo iniciar el repaso.",
    };
  }

  return {
    success: true,
    message: "Repaso iniciado.",
    gameId: reviewGame.id,
  };
}