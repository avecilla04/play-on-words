"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

import {
  completeGame,
  saveAnswer,
  startReviewGame,
} from "../../actions";

// ============================================================
// TIPOS
// ============================================================

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

type SavePayload = {
  gameId: string;
  wordId: string;
  position: number;
  direction: Direction;
  promptText: string;
  userAnswer: string;
  correctAnswers: string[];
  isCorrect: boolean;
};

// ============================================================
// NORMALIZAR RESPUESTAS
// ============================================================
//
// Ignora:
// - mayúsculas / minúsculas
// - á, é, í, ó, ú
// - ü
//
// Mantiene la ñ como letra diferente.
//
// Ejemplos:
// CASA = casa
// automóvil = automovil
//
// Pero:
// beautiful != beatiful
// ============================================================

function normalizeAnswer(text: string) {
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
// PRONUNCIACIÓN
// ============================================================

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

// ============================================================
// COMPONENTE
// ============================================================

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

  // Evita que un doble clic pueda registrar dos veces
  // la misma respuesta antes de que React actualice la pantalla.
  const answerLockedRef =
    useRef(false);

  // Promesas de guardado que se están ejecutando
  // en segundo plano.
  const pendingSaves =
    useRef<Promise<boolean>[]>([]);

  // Respuestas que no hayan podido sincronizarse.
  const failedSaves =
    useRef<SavePayload[]>([]);

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

  const [syncWarning, setSyncWarning] =
    useState("");

  const [isPending, startTransition] =
    useTransition();

  const currentWord =
    words[index];

  // ============================================================
  // PRECARGAR VOCES DEL DISPOSITIVO
  // ============================================================

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    window.speechSynthesis.getVoices();

    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };

    window.speechSynthesis.addEventListener(
      "voiceschanged",
      loadVoices
    );

    return () => {
      window.speechSynthesis.removeEventListener(
        "voiceschanged",
        loadVoices
      );
    };
  }, []);

  // ============================================================
  // INTENTAR GUARDAR UNA RESPUESTA
  // ============================================================

  async function trySave(
    payload: SavePayload
  ) {
    try {
      return await saveAnswer(payload);
    } catch (error) {
      console.error(
        "Error de sincronización:",
        error
      );

      return {
        success: false,
        message:
          "No se pudo sincronizar la respuesta.",
      };
    }
  }

  // ============================================================
  // GUARDADO EN SEGUNDO PLANO
  // ============================================================

  function queueSave(
    payload: SavePayload
  ) {
    const promise = (async () => {
      // Primer intento

      let result =
        await trySave(payload);

      // Si falla, esperamos medio segundo
      // y hacemos un segundo intento automáticamente.

      if (!result.success) {
        await new Promise((resolve) =>
          setTimeout(resolve, 500)
        );

        result =
          await trySave(payload);
      }

      // Si vuelve a fallar, guardamos la respuesta
      // en una cola para intentarlo al finalizar.

      if (!result.success) {
        failedSaves.current.push(
          payload
        );

        setSyncWarning(
          "Hay respuestas pendientes de sincronizar."
        );

        return false;
      }

      return true;
    })();

    pendingSaves.current.push(
      promise
    );
  }

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
      <main className="app-shell bg-slate-50">
        <div className="mx-auto w-full max-w-md">

          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-7">

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
                  onClick={
                    handleReviewErrors
                  }
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
  // DATOS DE LA PALABRA ACTUAL
  // ============================================================

  const promptText =
    direction === "en_to_es"
      ? currentWord.english
      : currentWord.translations[0];

  const correctAnswers =
    direction === "en_to_es"
      ? currentWord.translations
      : [currentWord.english];

  const currentNumber =
    answeredBefore + index + 1;

  // ============================================================
  // COMPROBAR RESPUESTA LOCALMENTE
  // ============================================================

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    // Evitar doble envío.

    if (
      feedback ||
      answerLockedRef.current
    ) {
      return;
    }

    const cleanAnswer =
      answer.trim();

    if (!cleanAnswer) {
      setErrorMessage(
        "Escribe una respuesta."
      );

      return;
    }

    answerLockedRef.current = true;

    setErrorMessage("");

    // ------------------------------------------------
    // CORRECCIÓN LOCAL
    // ------------------------------------------------

    const normalizedUserAnswer =
      normalizeAnswer(cleanAnswer);

    const isCorrect =
      correctAnswers.some(
        (correctAnswer) =>
          normalizeAnswer(
            correctAnswer
          ) ===
          normalizedUserAnswer
      );

    // ------------------------------------------------
    // MOSTRAR RESULTADO INMEDIATAMENTE
    // ------------------------------------------------

    setFeedback({
      isCorrect,
      correctAnswers,
    });

    if (isCorrect) {
      setCorrect(
        (current) => current + 1
      );
    } else {
      setIncorrect(
        (current) => current + 1
      );
    }

    // ------------------------------------------------
    // SINCRONIZAR EN SEGUNDO PLANO
    // ------------------------------------------------

    queueSave({
      gameId,
      wordId: currentWord.id,

      position:
        answeredBefore +
        index +
        1,

      direction,

      promptText,

      userAnswer:
        cleanAnswer,

      correctAnswers,

      isCorrect,
    });
  }

  // ============================================================
  // FINALIZAR PARTIDA
  // ============================================================

  async function finishGame() {
    setErrorMessage("");

    // ------------------------------------------------
    // ESPERAR LOS GUARDADOS EN SEGUNDO PLANO
    // ------------------------------------------------

    try {
      await Promise.all(
        pendingSaves.current
      );
    } catch (error) {
      console.error(
        "Error esperando sincronización:",
        error
      );
    }

    // ------------------------------------------------
    // REINTENTAR RESPUESTAS QUE HAYAN FALLADO
    // ------------------------------------------------

    if (
      failedSaves.current.length > 0
    ) {
      const retryPayloads = [
        ...failedSaves.current,
      ];

      failedSaves.current = [];

      const retryResults =
        await Promise.all(
          retryPayloads.map(
            async (payload) =>
              await trySave(payload)
          )
        );

      const stillFailed =
        retryResults.some(
          (result) =>
            !result.success
        );

      if (stillFailed) {
        // Guardamos de nuevo las que sigan fallando.

        retryResults.forEach(
          (result, index) => {
            if (!result.success) {
              failedSaves.current.push(
                retryPayloads[index]
              );
            }
          }
        );

        setErrorMessage(
          "No se han podido sincronizar todas las respuestas. Comprueba tu conexión y vuelve a pulsar VER RESULTADO."
        );

        return;
      }
    }

    setSyncWarning("");

    // ------------------------------------------------
    // FINALIZAR PARTIDA EN SUPABASE
    // ------------------------------------------------

    const result =
      await completeGame(gameId);

    if (!result.success) {
      setErrorMessage(
        "No se pudo finalizar la partida."
      );

      return;
    }

    setFinished(true);
  }

  // ============================================================
  // SIGUIENTE PALABRA
  // ============================================================

  function handleNext() {
    const isLast =
      index >= words.length - 1;

    // ------------------------------------------------
    // ÚLTIMA PALABRA
    // ------------------------------------------------

    if (isLast) {
      startTransition(async () => {
        await finishGame();
      });

      return;
    }

    // ------------------------------------------------
    // SIGUIENTE PALABRA
    // ------------------------------------------------
    //
    // Esto es completamente local.
    // No necesitamos consultar Supabase.
    // ------------------------------------------------

    setIndex(
      (current) => current + 1
    );

    setAnswer("");
    setFeedback(null);
    setErrorMessage("");

    answerLockedRef.current = false;

    setTimeout(() => {
      inputRef.current?.focus();
    }, 30);
  }

  // ============================================================
  // JUEGO
  // ============================================================

  return (
    <main className="app-shell bg-slate-50">

      <div className="mx-auto w-full max-w-md">

        {/* CABECERA */}

        <div className="mb-5 flex items-center justify-between">

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

        {/* BARRA DE PROGRESO */}

        <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-200">

          <div
            className="h-full bg-slate-900 transition-all duration-300"
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

        {/* TARJETA PRINCIPAL */}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

          <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
            {direction === "en_to_es"
              ? "Traduce al español"
              : "Traduce al inglés"}
          </p>

          <h1 className="mt-6 break-words text-center text-3xl font-bold text-slate-900 sm:text-4xl">
            {promptText}
          </h1>

          {/* PRONUNCIACIÓN */}

          <div className="mt-5 text-center">

            <button
              type="button"
              onClick={() =>
                speakEnglish(
                  currentWord.english
                )
              }
              className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition active:scale-95"
            >
              🔊 Escuchar
            </button>

          </div>

          {/* RESPUESTA */}

          <form
            onSubmit={handleSubmit}
            className="mt-7"
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
                Boolean(feedback)
              }
              onChange={(event) =>
                setAnswer(
                  event.target.value
                )
              }
              autoComplete="off"
              autoCapitalize="none"
              autoFocus
              className="w-full rounded-2xl border border-slate-300 px-4 py-3.5 text-base outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5 disabled:bg-slate-50"
            />

            {errorMessage && (
              <p className="mt-3 text-sm font-medium text-red-600">
                {errorMessage}
              </p>
            )}

            {!feedback && (
              <button
                type="submit"
                className="mt-5 w-full rounded-2xl bg-slate-900 px-5 py-4 font-bold text-white transition active:scale-[0.99]"
              >
                COMPROBAR
              </button>
            )}

          </form>

          {/* RESULTADO */}

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
                className="mt-5 w-full rounded-2xl bg-slate-900 px-5 py-4 font-bold text-white transition active:scale-[0.99] disabled:opacity-50"
              >
                {isPending
                  ? "Guardando..."
                  : currentNumber ===
                    totalWords
                    ? "VER RESULTADO"
                    : "SIGUIENTE PALABRA"}
              </button>

            </div>
          )}

        </section>

        {/* MARCADOR */}

        <div className="mt-5 flex justify-center gap-6 text-sm">

          <span className="font-semibold text-green-700">
            ✓ {correct}
          </span>

          <span className="font-semibold text-red-700">
            ✕ {incorrect}
          </span>

        </div>

        {/* AVISO DE SINCRONIZACIÓN */}

        {syncWarning && (
          <p className="mt-3 text-center text-xs text-amber-600">
            {syncWarning}
          </p>
        )}

      </div>

    </main>
  );
}