import { redirect } from "next/navigation";

import { createClient, getAuthUser } from "@/lib/supabase/server";
import { fetchAll } from "@/lib/supabase/fetch-all";
import { normalizeAnswer } from "@/lib/answer-matching";
import GameClient, { type GameWord } from "./game-client";

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

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

export default async function GamePage({ params }: PageProps) {
  const { gameId } = await params;

  const supabase = await createClient();

  const user = await getAuthUser(supabase);

  if (!user) {
    redirect("/auth/login");
  }

  // ------------------------------------------------
  // Partida, palabras y traducciones (todo a la vez)
  // ------------------------------------------------
  //
  // Se leen por páginas (Supabase devuelve máx. 1000 filas)
  // y se filtran en memoria. Así evitamos filtros .in()
  // con cientos de IDs, que fallan con vocabularios grandes.
  // ------------------------------------------------

  const [gameResult, allWords, allTranslations, previousAnswersData] =
    await Promise.all([
      supabase
        .from("games")
        .select(
          "id, direction, scope, category_id, source_game_id, total_words, correct_answers, incorrect_answers, status"
        )
        .eq("id", gameId)
        .eq("user_id", user.id)
        .maybeSingle(),
      fetchAll<Word>((from, to) =>
        supabase
          .from("words")
          .select("id, english")
          .eq("user_id", user.id)
          .order("id")
          .range(from, to)
      ),
      fetchAll<Translation>((from, to) =>
        supabase
          .from("word_translations")
          .select("word_id, spanish")
          .eq("user_id", user.id)
          .order("word_id")
          .range(from, to)
      ),
      supabase
        .from("game_answers")
        .select("word_id, position, is_correct")
        .eq("game_id", gameId)
        .eq("user_id", user.id),
    ]);

  const game = gameResult.data;

  if (!game) {
    redirect("/protected/play");
  }

  const previousAnswers = previousAnswersData.data ?? [];

  // ------------------------------------------------
  // Palabras de la partida según su tipo
  // ------------------------------------------------

  let selectedWordIds: Set<string> | null = null;

  if (game.scope === "category" && game.category_id) {
    const links = await fetchAll<{ word_id: string }>((from, to) =>
      supabase
        .from("word_categories")
        .select("word_id")
        .eq("user_id", user.id)
        .eq("category_id", game.category_id)
        .order("word_id")
        .range(from, to)
    );

    selectedWordIds = new Set(links.map((link) => link.word_id));
  } else if (game.scope === "review_errors" && game.source_game_id) {
    const { data: failedAnswers } = await supabase
      .from("game_answers")
      .select("word_id")
      .eq("game_id", game.source_game_id)
      .eq("user_id", user.id)
      .eq("is_correct", false)
      .not("word_id", "is", null);

    selectedWordIds = new Set(
      (failedAnswers ?? [])
        .map((answer) => answer.word_id)
        .filter((wordId): wordId is string => Boolean(wordId))
    );
  }

  const translationsByWord = new Map<string, string[]>();

  for (const translation of allTranslations) {
    const current = translationsByWord.get(translation.word_id) ?? [];
    current.push(translation.spanish);
    translationsByWord.set(translation.word_id, current);
  }

  const scopeWords = allWords
    .filter((word) => !selectedWordIds || selectedWordIds.has(word.id))
    .map((word) => ({
      id: word.id,
      english: word.english,
      translations: translationsByWord.get(word.id) ?? [],
    }))
    .filter((word) => word.translations.length > 0);

  // ------------------------------------------------
  // Sinónimos para el modo Español → Inglés
  // ------------------------------------------------
  //
  // Si aparece "delgado/a", valen tanto "slim" como "thin".
  // Se aceptan todas las palabras inglesas del usuario que
  // tengan como traducción el texto que se muestra.
  // ------------------------------------------------

  const englishBySpanish = new Map<string, Set<string>>();

  for (const word of allWords) {
    for (const spanish of translationsByWord.get(word.id) ?? []) {
      const key = normalizeAnswer(spanish, "es");
      const current = englishBySpanish.get(key) ?? new Set<string>();
      current.add(word.english);
      englishBySpanish.set(key, current);
    }
  }

  // ------------------------------------------------
  // Palabras todavía no contestadas
  // ------------------------------------------------

  const answeredWordIds = new Set(
    previousAnswers
      .map((answer) => answer.word_id)
      .filter((wordId): wordId is string => Boolean(wordId))
  );

  const correctSoFar = previousAnswers.filter(
    (answer) => answer.is_correct
  ).length;

  const incorrectSoFar = previousAnswers.length - correctSoFar;

  const remaining = Math.max(
    0,
    game.total_words - previousAnswers.length
  );

  const gameWords: GameWord[] = shuffle(
    scopeWords.filter((word) => !answeredWordIds.has(word.id))
  )
    .slice(0, remaining)
    .map((word) => {
      // En español → inglés mostramos una traducción al azar
      // para no ver siempre la misma.
      const prompt =
        word.translations[
          Math.floor(Math.random() * word.translations.length)
        ];

      const synonyms = Array.from(
        englishBySpanish.get(normalizeAnswer(prompt, "es")) ?? []
      ).filter((english) => english !== word.english);

      return {
        id: word.id,
        english: word.english,
        translations: word.translations,
        spanishPrompt: prompt,
        englishAnswers: [word.english, ...synonyms],
      };
    });

  return (
    <GameClient
      gameId={game.id}
      direction={game.direction}
      words={gameWords}
      totalWords={
        game.status === "completed"
          ? game.total_words
          : Math.min(
              game.total_words,
              previousAnswers.length + gameWords.length
            )
      }
      answeredBefore={previousAnswers.length}
      initialCorrect={correctSoFar}
      initialIncorrect={incorrectSoFar}
      alreadyCompleted={game.status === "completed"}
    />
  );
}
