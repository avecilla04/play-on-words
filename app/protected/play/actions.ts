"use server";

import { createClient } from "@/lib/supabase/server";

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

type AnswerInput = {
  gameId: string;
  wordId: string;
  position: number;
  promptText: string;
  userAnswer: string;
};

type AnswerResult = {
  success: boolean;
  message: string;
  isCorrect?: boolean;
  correctAnswers?: string[];
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

export async function recordAnswer(
  input: AnswerInput
): Promise<AnswerResult> {
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

  const answer = input.userAnswer.trim();

  if (!answer) {
    return {
      success: false,
      message: "Escribe una respuesta.",
    };
  }

  // ------------------------------------------------
  // Comprobar la partida
  // ------------------------------------------------

  const { data: game } = await supabase
    .from("games")
    .select("id, direction, status")
    .eq("id", input.gameId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!game) {
    return {
      success: false,
      message: "No se encontró la partida.",
    };
  }

  if (game.status !== "in_progress") {
    return {
      success: false,
      message: "Esta partida ya ha terminado.",
    };
  }

  // ------------------------------------------------
  // Evitar doble respuesta en una misma posición
  // ------------------------------------------------

  const { data: previousAnswer } = await supabase
    .from("game_answers")
    .select(
      "is_correct, correct_answers"
    )
    .eq("game_id", input.gameId)
    .eq("position", input.position)
    .eq("user_id", user.id)
    .maybeSingle();

  if (previousAnswer) {
    return {
      success: true,
      message: "Respuesta ya registrada.",
      isCorrect: previousAnswer.is_correct,
      correctAnswers:
        previousAnswer.correct_answers ?? [],
    };
  }

  // ------------------------------------------------
  // Obtener palabra inglesa
  // ------------------------------------------------

  const { data: word, error: wordError } =
    await supabase
      .from("words")
      .select("id, english")
      .eq("id", input.wordId)
      .eq("user_id", user.id)
      .maybeSingle();

  if (wordError || !word) {
    return {
      success: false,
      message: "No se encontró la palabra.",
    };
  }

  // ------------------------------------------------
  // Obtener traducciones
  // ------------------------------------------------

  const { data: translations, error: translationsError } =
    await supabase
      .from("word_translations")
      .select("spanish")
      .eq("word_id", word.id)
      .eq("user_id", user.id);

  if (translationsError) {
    console.error(translationsError);

    return {
      success: false,
      message:
        "No se pudieron comprobar las traducciones.",
    };
  }

  let correctAnswers: string[] = [];

  if (game.direction === "en_to_es") {
    correctAnswers = (translations ?? []).map(
      (translation) => translation.spanish
    );
  } else {
    correctAnswers = [word.english];
  }

  const normalizedAnswer = normalizeText(answer);

  const isCorrect = correctAnswers.some(
    (correctAnswer) =>
      normalizeText(correctAnswer) ===
      normalizedAnswer
  );

  // ------------------------------------------------
  // Guardar respuesta
  // ------------------------------------------------

  const { error: answerError } = await supabase
    .from("game_answers")
    .insert({
      user_id: user.id,
      game_id: input.gameId,
      word_id: word.id,
      position: input.position,
      direction: game.direction,
      prompt_text: input.promptText,
      user_answer: answer,
      correct_answers: correctAnswers,
      is_correct: isCorrect,
    });

  if (answerError) {
    console.error(answerError);

    return {
      success: false,
      message: "No se pudo guardar tu respuesta.",
    };
  }

  // ------------------------------------------------
  // Actualizar estadísticas de la partida
  // ------------------------------------------------

  const { data: gameAnswers } = await supabase
    .from("game_answers")
    .select("is_correct")
    .eq("game_id", input.gameId)
    .eq("user_id", user.id);

  const correctCount =
    (gameAnswers ?? []).filter(
      (item) => item.is_correct
    ).length;

  const incorrectCount =
    (gameAnswers ?? []).filter(
      (item) => !item.is_correct
    ).length;

  await supabase
    .from("games")
    .update({
      correct_answers: correctCount,
      incorrect_answers: incorrectCount,
    })
    .eq("id", input.gameId)
    .eq("user_id", user.id);

  return {
    success: true,
    message: isCorrect
      ? "Correcto."
      : "Respuesta incorrecta.",
    isCorrect,
    correctAnswers,
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

  const { data: answers } = await supabase
    .from("game_answers")
    .select("is_correct")
    .eq("game_id", gameId)
    .eq("user_id", user.id);

  const correct =
    (answers ?? []).filter(
      (answer) => answer.is_correct
    ).length;

  const incorrect =
    (answers ?? []).filter(
      (answer) => !answer.is_correct
    ).length;

  const { error } = await supabase
    .from("games")
    .update({
      correct_answers: correct,
      incorrect_answers: incorrect,
      status: "completed",
      completed_at: new Date().toISOString(),
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
  // Obtener la partida original
  // ------------------------------------------------

  const { data: sourceGame, error: sourceGameError } =
    await supabase
      .from("games")
      .select("id, direction")
      .eq("id", sourceGameId)
      .eq("user_id", user.id)
      .maybeSingle();

  if (sourceGameError || !sourceGame) {
    return {
      success: false,
      message: "No se encontró la partida.",
    };
  }

  // ------------------------------------------------
  // Obtener únicamente las palabras falladas
  // ------------------------------------------------

  const { data: failedAnswers, error: failedAnswersError } =
    await supabase
      .from("game_answers")
      .select("word_id")
      .eq("game_id", sourceGameId)
      .eq("user_id", user.id)
      .eq("is_correct", false)
      .not("word_id", "is", null);

  if (failedAnswersError) {
    console.error(failedAnswersError);

    return {
      success: false,
      message: "No se pudieron cargar los errores.",
    };
  }

  const failedWordIds = Array.from(
    new Set(
      (failedAnswers ?? [])
        .map((answer) => answer.word_id)
        .filter(
          (wordId): wordId is string =>
            Boolean(wordId)
        )
    )
  );

  if (failedWordIds.length === 0) {
    return {
      success: false,
      message: "No tienes errores que repasar.",
    };
  }

  // ------------------------------------------------
  // Crear nueva partida de repaso
  // ------------------------------------------------

  const { data: reviewGame, error: reviewGameError } =
    await supabase
      .from("games")
      .insert({
        user_id: user.id,
        direction: sourceGame.direction,
        scope: "review_errors",
        source_game_id: sourceGameId,
        category_id: null,
        category_name: null,
        total_words: failedWordIds.length,
        correct_answers: 0,
        incorrect_answers: 0,
        status: "in_progress",
      })
      .select("id")
      .single();

  if (reviewGameError || !reviewGame) {
    console.error(reviewGameError);

    return {
      success: false,
      message: "No se pudo iniciar el repaso.",
    };
  }

  return {
    success: true,
    message: "Repaso iniciado.",
    gameId: reviewGame.id,
  };
}