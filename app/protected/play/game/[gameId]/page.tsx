import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GameClient from "./game-client";

type PageProps = {
  params: Promise<{
    gameId: string;
  }>;
};

type Word = {
  id: string;
  english: string;
};

type Translation = {
  word_id: string;
  spanish: string;
};

function shuffle<T>(array: T[]) {
  const result = [...array];

  for (
    let i = result.length - 1;
    i > 0;
    i--
  ) {
    const j = Math.floor(
      Math.random() * (i + 1)
    );

    [result[i], result[j]] = [
      result[j],
      result[i],
    ];
  }

  return result;
}

export default async function GamePage({
  params,
}: PageProps) {
  const { gameId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // ------------------------------------------------
  // Partida
  // ------------------------------------------------

  const { data: game } = await supabase
    .from("games")
    .select(
        "id, direction, scope, category_id, source_game_id, total_words, correct_answers, incorrect_answers, status"
    )
    .eq("id", gameId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!game) {
    redirect("/protected/play");
  }

  // ------------------------------------------------
  // Obtener IDs de palabras
  // ------------------------------------------------
let selectedWordIds:
  | string[]
  | null = null;

// ------------------------------------------------
// PARTIDA POR CATEGORÍA
// ------------------------------------------------

if (
  game.scope === "category" &&
  game.category_id
) {
  const { data: links } =
    await supabase
      .from("word_categories")
      .select("word_id")
      .eq("user_id", user.id)
      .eq(
        "category_id",
        game.category_id
      );

  selectedWordIds = Array.from(
    new Set(
      (links ?? []).map(
        (link) => link.word_id
      )
    )
  );
}

// ------------------------------------------------
// REPASO DE ERRORES
// ------------------------------------------------

else if (
  game.scope === "review_errors" &&
  game.source_game_id
) {
  const { data: failedAnswers } =
    await supabase
      .from("game_answers")
      .select("word_id")
      .eq(
        "game_id",
        game.source_game_id
      )
      .eq("user_id", user.id)
      .eq("is_correct", false)
      .not("word_id", "is", null);

  selectedWordIds = Array.from(
    new Set(
      (failedAnswers ?? [])
        .map(
          (answer) => answer.word_id
        )
        .filter(
          (wordId): wordId is string =>
            Boolean(wordId)
        )
    )
  );
}

  // ------------------------------------------------
  // Palabras
  // ------------------------------------------------

  let words: Word[] = [];

  if (
    selectedWordIds !== null &&
    selectedWordIds.length === 0
  ) {
    words = [];
  } else {
    let query = supabase
      .from("words")
      .select("id, english")
      .eq("user_id", user.id);

    if (selectedWordIds) {
      query = query.in(
        "id",
        selectedWordIds
      );
    }

    const { data } = await query;

    words =
      (data as Word[] | null) ?? [];
  }

  // ------------------------------------------------
  // Traducciones
  // ------------------------------------------------

  const wordIds = words.map(
    (word) => word.id
  );

  let translations: Translation[] =
    [];

  if (wordIds.length > 0) {
    const { data } = await supabase
      .from("word_translations")
      .select("word_id, spanish")
      .eq("user_id", user.id)
      .in("word_id", wordIds);

    translations =
      (data as Translation[] | null) ??
      [];
  }

  const translationsByWord =
    new Map<string, string[]>();

  for (const translation of translations) {
    const current =
      translationsByWord.get(
        translation.word_id
      ) ?? [];

    current.push(
      translation.spanish
    );

    translationsByWord.set(
      translation.word_id,
      current
    );
  }

  // ------------------------------------------------
  // Respuestas que ya existan
  // ------------------------------------------------

  const { data: previousAnswers } =
    await supabase
      .from("game_answers")
      .select(
        "word_id, position, is_correct"
      )
      .eq("game_id", gameId)
      .eq("user_id", user.id);

  const answeredWordIds = new Set(
    (previousAnswers ?? [])
      .map((answer) => answer.word_id)
      .filter(
        (wordId): wordId is string =>
          Boolean(wordId)
      )
  );

  const correctSoFar =
    (previousAnswers ?? []).filter(
      (answer) => answer.is_correct
    ).length;

  const incorrectSoFar =
    (previousAnswers ?? []).filter(
      (answer) => !answer.is_correct
    ).length;

  // ------------------------------------------------
  // Preparar palabras todavía no contestadas
  // ------------------------------------------------

  const gameWords = words
    .map((word) => ({
      id: word.id,
      english: word.english,
      translations:
        translationsByWord.get(
          word.id
        ) ?? [],
    }))
    .filter(
      (word) =>
        word.translations.length > 0 &&
        !answeredWordIds.has(word.id)
    );

  const shuffledWords =
    shuffle(gameWords);

  return (
    <GameClient
      gameId={game.id}
      direction={game.direction}
      words={shuffledWords}
      totalWords={game.total_words}
      answeredBefore={
        previousAnswers?.length ?? 0
      }
      initialCorrect={correctSoFar}
      initialIncorrect={
        incorrectSoFar
      }
      alreadyCompleted={
        game.status === "completed"
      }
    />
  );
}