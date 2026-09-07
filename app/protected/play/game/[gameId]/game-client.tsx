"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  FormEvent,
  useRef,
  useState,
  useTransition,
} from "react";

import {
  completeGame,
  recordAnswer,
  startReviewGame,
} from "../../actions";

type GameWord = {
  id: string;
  english: string;
  translations: string[];
};

type Direction =
  | "en_to_es"
  | "es_to_en";

type Feedback = {
  isCorrect: boolean;
  correctAnswers: string[];
};

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

  window.speechSynthesis.speak(
    utterance
  );
}

export default function GameClient({
  gameId,
  direction,
  words,
  totalWords,
  answeredBefore,
  initialCorrect,
  initialIncorrect,
  alreadyCompleted,
}: {
  gameId: string;
  direction: Direction;
  words: GameWord[];
  totalWords: number;
  answeredBefore: number;
  initialCorrect: number;
  initialIncorrect: number;
  alreadyCompleted: boolean;
}) {
  const router = useRouter();

  const inputRef =
    useRef<HTMLInputElement>(null);

  const [index, setIndex] =
    useState(0);

  const [answer, setAnswer] =
    useState("");

  const [feedback, setFeedback] =
    useState<Feedback | null>(null);

  const [correct, setCorrect] =
    useState(initialCorrect);

  const [incorrect, setIncorrect] =
    useState(initialIncorrect);

  const [finished, setFinished] =
    useState(
      alreadyCompleted ||
        words.length === 0
    );

  const [errorMessage, setErrorMessage] =
    useState("");

  const [isPending, startTransition] =
    useTransition();

  const currentWord =
    words[index];

  // ============================================================
  // REPASAR ERRORES
  // ============================================================

  function handleReviewErrors() {
    setErrorMessage("");

    startTransition(async () => {
      const result =
        await startReviewGame(gameId);

      if (
        !result.success ||
        !result.gameId
      ) {
        setErrorMessage(
          result.message
        );

        return;
      }

      router.push(
        `/protected/play/game/${result.gameId}`
      );
    });
  }

  // ============================================================
  // PANTALLA FINAL
  // ============================================================

  if (finished || !currentWord) {
    const answered =
      correct + incorrect;

    const percentage =
      answered === 0
        ? 0
        : Math.round(
            (correct / answered) * 100
          );

    return (
      <main className="min-h-screen bg-slate-50 px-5 py-10">
        <div className="mx-auto max-w-md">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm">
            <div className="text-4xl">
              🎉
            </div>

            <h1 className="mt-4 text-3xl font-bold text-slate-900">
              Partida terminada
            </h1>

            <div className="mt-8 text-5xl font-bold text-slate-900">
              {percentage}%
            </div>

            <p className="mt-2 text-slate-500">
              de aciertos
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-green-50 p-5">
                <div className="text-3xl font-bold text-green-700">
                  {correct}
                </div>

                <div className="mt-1 text-sm text-green-700">
                  Correctas
                </div>
              </div>

              <div className="rounded-2xl bg-red-50 p-5">
                <div className="text-3xl font-bold text-red-700">
                  {incorrect}
                </div>

                <div className="mt-1 text-sm text-red-700">
                  Errores
                </div>
              </div>
            </div>

            <p className="mt-6 text-sm text-slate-500">
              {answered} de{" "}
              {totalWords} palabras practicadas
            </p>

            {errorMessage && (
              <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
                ✕ {errorMessage}
              </div>
            )}

            <div className="mt-8 space-y-3">

              {incorrect > 0 && (
                <button
                  type="button"
                  onClick={handleReviewErrors}
                  disabled={isPending}
                  className="w-full rounded-2xl bg-amber-500 px-5 py-4 font-bold text-white disabled:opacity-50"
                >
                  {isPending
                    ? "Preparando repaso..."
                    : `REPASAR ${incorrect} ${
                        incorrect === 1
                          ? "ERROR"
                          : "ERRORES"
                      }`}
                </button>
              )}

              <Link
                href="/protected/play"
                className="block rounded-2xl bg-slate-900 px-5 py-4 font-semibold text-white"
              >
                VOLVER A JUGAR
              </Link>

              <Link
                href="/protected"
                className="block rounded-2xl border border-slate-300 px-5 py-4 font-semibold text-slate-700"
              >
                INICIO
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ============================================================
  // PALABRA QUE APARECERÁ
  // ============================================================

  const promptText =
    direction === "en_to_es"
      ? currentWord.english
      : currentWord.translations[0];

  const currentNumber =
    answeredBefore + index + 1;

  // ============================================================
  // COMPROBAR RESPUESTA
  // ============================================================

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (feedback) return;

    if (!answer.trim()) {
      setErrorMessage(
        "Escribe una respuesta."
      );

      return;
    }

    setErrorMessage("");

    startTransition(async () => {
      const result =
        await recordAnswer({
          gameId,
          wordId: currentWord.id,
          position:
            answeredBefore +
            index +
            1,
          promptText,
          userAnswer: answer,
        });

      if (
        !result.success ||
        result.isCorrect === undefined
      ) {
        setErrorMessage(
          result.message
        );

        return;
      }

      setFeedback({
        isCorrect:
          result.isCorrect,

        correctAnswers:
          result.correctAnswers ?? [],
      });

      if (result.isCorrect) {
        setCorrect(
          (current) => current + 1
        );
      } else {
        setIncorrect(
          (current) => current + 1
        );
      }
    });
  }

  // ============================================================
  // SIGUIENTE PALABRA
  // ============================================================

  function handleNext() {
    const isLast =
      index >= words.length - 1;

    if (isLast) {
      startTransition(async () => {
        const result =
          await completeGame(gameId);

        if (!result.success) {
          setErrorMessage(
            "No se pudo finalizar la partida."
          );

          return;
        }

        setFinished(true);
      });

      return;
    }

    setIndex(
      (current) => current + 1
    );

    setAnswer("");
    setFeedback(null);
    setErrorMessage("");

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }

  // ============================================================
  // JUEGO
  // ============================================================

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8">
      <div className="mx-auto max-w-md">

        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/protected"
            className="text-sm font-medium text-slate-500"
          >
            ← Salir
          </Link>

          <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
            {currentNumber} /{" "}
            {totalWords}
          </span>
        </div>

        {/* Barra de progreso */}

        <div className="mb-5 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full bg-slate-900 transition-all"
            style={{
              width: `${Math.min(
                100,
                (currentNumber /
                  totalWords) *
                  100
              )}%`,
            }}
          />
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

          <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
            {direction === "en_to_es"
              ? "Traduce al español"
              : "Traduce al inglés"}
          </p>

          <h1 className="mt-8 text-center text-4xl font-bold text-slate-900">
            {promptText}
          </h1>

          {/* Pronunciación */}

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() =>
                speakEnglish(
                  currentWord.english
                )
              }
              className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
            >
              🔊 Escuchar
            </button>
          </div>

          {/* Respuesta */}

          <form
            onSubmit={handleSubmit}
            className="mt-8"
          >
            <label
              htmlFor="game-answer"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Tu respuesta
            </label>

            <input
              ref={inputRef}
              id="game-answer"
              type="text"
              value={answer}
              disabled={
                Boolean(feedback) ||
                isPending
              }
              onChange={(event) =>
                setAnswer(
                  event.target.value
                )
              }
              autoComplete="off"
              autoCapitalize="none"
              autoFocus
              className="w-full rounded-2xl border border-slate-300 px-4 py-4 text-lg outline-none focus:border-slate-900 disabled:bg-slate-50"
            />

            {errorMessage && (
              <p className="mt-3 text-sm font-medium text-red-600">
                {errorMessage}
              </p>
            )}

            {!feedback && (
              <button
                type="submit"
                disabled={isPending}
                className="mt-5 w-full rounded-2xl bg-slate-900 px-5 py-4 font-bold text-white disabled:opacity-50"
              >
                {isPending
                  ? "Comprobando..."
                  : "COMPROBAR"}
              </button>
            )}
          </form>

          {/* Resultado de la palabra */}

          {feedback && (
            <div className="mt-6">

              {feedback.isCorrect ? (
                <div className="rounded-2xl bg-green-50 p-5 text-center">
                  <div className="text-2xl font-bold text-green-700">
                    ✓ CORRECTO
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-red-50 p-5 text-center">
                  <div className="text-2xl font-bold text-red-700">
                    ✕ ERROR
                  </div>

                  <p className="mt-3 text-sm text-red-700">
                    Respuesta correcta:
                  </p>

                  <p className="mt-1 text-xl font-bold text-red-800">
                    {feedback.correctAnswers.join(
                      " / "
                    )}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={isPending}
                className="mt-5 w-full rounded-2xl bg-slate-900 px-5 py-4 font-bold text-white disabled:opacity-50"
              >
                {currentNumber ===
                totalWords
                  ? "VER RESULTADO"
                  : "SIGUIENTE PALABRA"}
              </button>

            </div>
          )}
        </section>

        {/* Marcador */}

        <div className="mt-5 flex justify-center gap-6 text-sm">
          <span className="font-semibold text-green-700">
            ✓ {correct}
          </span>

          <span className="font-semibold text-red-700">
            ✕ {incorrect}
          </span>
        </div>

      </div>
    </main>
  );
}