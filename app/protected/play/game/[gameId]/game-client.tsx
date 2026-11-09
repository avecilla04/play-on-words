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
  buildHint,
  checkAnswer,
  countLetters,
  type AnswerLanguage,
} from "@/lib/answer-matching";

import {
  completeGame,
  saveAnswer,
  startReviewGame,
} from "../../actions";

// ============================================================
// TIPOS
// ============================================================

export type GameWord = {
  id: string;
  english: string;
  translations: string[];
  // Texto que se muestra en el modo Español → Inglés
  spanishPrompt: string;
  // Respuestas válidas en el modo Español → Inglés
  // (la palabra + sinónimos con la misma traducción)
  englishAnswers: string[];
};

type Direction = "en_to_es" | "es_to_en";

type Feedback = {
  isCorrect: boolean;
  skipped: boolean;
  wasAlmost: boolean;
  userAnswer: string;
  matched: string | null;
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

type SessionResult = {
  prompt: string;
  english: string;
  userAnswer: string;
  correctAnswers: string[];
  isCorrect: boolean;
  skipped: boolean;
};

const SKIPPED_ANSWER = "(no lo sé)";
const AUTO_SPEAK_KEY = "pow-auto-speak";

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

  const utterance = new SpeechSynthesisUtterance(
    word.replace(/\([^)]*\)/g, "")
  );

  utterance.lang = "en-GB";
  utterance.rate = 0.9;

  const britishVoice = window.speechSynthesis
    .getVoices()
    .find((voice) => voice.lang === "en-GB");

  if (britishVoice) {
    utterance.voice = britishVoice;
  }

  window.speechSynthesis.speak(utterance);
}

function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // No disponible (iOS / escritorio)
  }
}

function finalMessage(percentage: number) {
  if (percentage === 100) return "¡Perfecto! Ni un solo fallo 🏆";
  if (percentage >= 85) return "¡Excelente! Lo tienes muy dominado.";
  if (percentage >= 65) return "¡Buen trabajo! Vas por muy buen camino.";
  if (percentage >= 40) return "Bien. Repasa los fallos y vuelve a intentarlo.";
  return "Cada error es una palabra que aprendes. ¡A repasar!";
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

  const inputRef = useRef<HTMLInputElement>(null);

  // Evita que un doble clic registre dos veces la misma respuesta.
  const answerLockedRef = useRef(false);

  // Guardados en segundo plano y los que han fallado.
  const pendingSaves = useRef<Promise<boolean>[]>([]);
  const failedSaves = useRef<SavePayload[]>([]);

  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  // Casi-acierto: se avisa una vez y se deja corregir.
  const [almostWarning, setAlmostWarning] = useState(false);
  const almostUsedRef = useRef(false);

  // Pistas
  const [hintLevel, setHintLevel] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);

  const [correct, setCorrect] = useState(initialCorrect);
  const [incorrect, setIncorrect] = useState(initialIncorrect);

  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const [sessionResults, setSessionResults] = useState<SessionResult[]>(
    []
  );

  const [finished, setFinished] = useState(
    alreadyCompleted || words.length === 0
  );

  const [errorMessage, setErrorMessage] = useState("");
  const [syncWarning, setSyncWarning] = useState("");

  const [autoSpeak, setAutoSpeak] = useState(true);

  const [animation, setAnimation] = useState<"" | "shake" | "pop">("");

  const [isPending, startTransition] = useTransition();

  const currentWord = words[index];

  const answerLanguage: AnswerLanguage =
    direction === "en_to_es" ? "es" : "en";

  // ============================================================
  // PREFERENCIA DE AUDIO AUTOMÁTICO
  // ============================================================

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(AUTO_SPEAK_KEY);
      if (stored !== null) setAutoSpeak(stored === "1");
    } catch {
      // localStorage no disponible
    }
  }, []);

  function toggleAutoSpeak() {
    setAutoSpeak((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(AUTO_SPEAK_KEY, next ? "1" : "0");
      } catch {
        // localStorage no disponible
      }
      return next;
    });
  }

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

    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };

    loadVoices();

    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener(
        "voiceschanged",
        loadVoices
      );
    };
  }, []);

  // En inglés → español, leer la palabra al aparecer.
  useEffect(() => {
    if (
      autoSpeak &&
      !finished &&
      currentWord &&
      direction === "en_to_es"
    ) {
      speakEnglish(currentWord.english);
    }
    // Solo cuando cambia la palabra.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, finished]);

  // Quitar la animación cuando termina.
  useEffect(() => {
    if (!animation) return;
    const timeout = setTimeout(() => setAnimation(""), 450);
    return () => clearTimeout(timeout);
  }, [animation]);

  // ============================================================
  // GUARDADO EN SEGUNDO PLANO
  // ============================================================

  async function trySave(payload: SavePayload) {
    try {
      return await saveAnswer(payload);
    } catch (error) {
      console.error("Error de sincronización:", error);

      return {
        success: false,
        message: "No se pudo sincronizar la respuesta.",
      };
    }
  }

  function queueSave(payload: SavePayload) {
    const promise = (async () => {
      let result = await trySave(payload);

      if (!result.success) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        result = await trySave(payload);
      }

      if (!result.success) {
        failedSaves.current.push(payload);
        setSyncWarning("Hay respuestas pendientes de sincronizar.");
        return false;
      }

      return true;
    })();

    pendingSaves.current.push(promise);
  }

  // ============================================================
  // REPASAR ERRORES
  // ============================================================

  function handleReviewErrors() {
    setErrorMessage("");

    startTransition(async () => {
      const result = await startReviewGame(gameId);

      if (!result.success || !result.gameId) {
        setErrorMessage(result.message);
        return;
      }

      router.push(`/protected/play/game/${result.gameId}`);
    });
  }

  // ============================================================
  // DATOS DE LA PALABRA ACTUAL
  // ============================================================

  const promptText = currentWord
    ? direction === "en_to_es"
      ? currentWord.english
      : currentWord.spanishPrompt
    : "";

  const correctAnswers = currentWord
    ? direction === "en_to_es"
      ? currentWord.translations
      : currentWord.englishAnswers
    : [];

  const currentNumber = answeredBefore + index + 1;
  const isLast = index >= words.length - 1;

  const hintTarget = correctAnswers[0] ?? "";
  const maxHint = Math.max(0, countLetters(hintTarget) - 1);

  // ============================================================
  // REGISTRAR UNA RESPUESTA
  // ============================================================

  function registerAnswer({
      userAnswer,
      isCorrect,
      skipped,
      wasAlmost,
      matched,
    }: {
      userAnswer: string;
      isCorrect: boolean;
      skipped: boolean;
      wasAlmost: boolean;
      matched: string | null;
    }) {
      if (!currentWord) return;

      answerLockedRef.current = true;
      setErrorMessage("");
      setAlmostWarning(false);

      setFeedback({
        isCorrect,
        skipped,
        wasAlmost,
        userAnswer,
        matched,
        correctAnswers,
      });

      if (isCorrect) {
        setCorrect((current) => current + 1);
        setStreak((current) => {
          const next = current + 1;
          setBestStreak((best) => Math.max(best, next));
          return next;
        });
        setAnimation("pop");
        vibrate(15);
      } else {
        setIncorrect((current) => current + 1);
        setStreak(0);
        setAnimation("shake");
        vibrate([40, 40, 40]);
      }

      if (autoSpeak && direction === "es_to_en") {
        speakEnglish(currentWord.english);
      }

      setSessionResults((current) => [
        ...current,
        {
          prompt: promptText,
          english: currentWord.english,
          userAnswer,
          correctAnswers,
          isCorrect,
          skipped,
        },
      ]);

      queueSave({
        gameId,
        wordId: currentWord.id,
        position: answeredBefore + index + 1,
        direction,
        promptText,
        userAnswer,
        correctAnswers,
        isCorrect,
      });

      // Mantener el foco para poder pulsar Enter y seguir
      // (y que el teclado del móvil no se cierre).
      setTimeout(() => inputRef.current?.focus(), 0);
  }

  // ============================================================
  // COMPROBAR RESPUESTA
  // ============================================================

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Con la respuesta ya corregida, Enter pasa a la siguiente.
    if (feedback) {
      if (!isPending) handleNext();
      return;
    }

    if (answerLockedRef.current) {
      return;
    }

    const cleanAnswer = answer.trim();

    if (!cleanAnswer) {
      setErrorMessage("Escribe una respuesta o pulsa «No lo sé».");
      return;
    }

    const result = checkAnswer(cleanAnswer, correctAnswers, answerLanguage);

    // Primer casi-acierto: avisamos y dejamos corregir.
    if (result.kind === "almost" && !almostUsedRef.current) {
      almostUsedRef.current = true;
      setAlmostWarning(true);
      setErrorMessage("");
      setAnimation("shake");
      vibrate(30);
      inputRef.current?.focus();
      inputRef.current?.select();
      return;
    }

    registerAnswer({
      userAnswer: cleanAnswer,
      isCorrect: result.kind === "correct",
      skipped: false,
      wasAlmost: result.kind === "almost",
      matched: result.kind === "correct" ? result.matched : null,
    });
  }

  function handleSkip() {
    if (feedback || answerLockedRef.current) return;

    registerAnswer({
      userAnswer: SKIPPED_ANSWER,
      isCorrect: false,
      skipped: true,
      wasAlmost: false,
      matched: null,
    });
  }

  function handleHint() {
    if (feedback || hintLevel >= maxHint) return;

    if (hintLevel === 0) {
      setHintsUsed((current) => current + 1);
    }

    setHintLevel((current) => Math.min(maxHint, current + 1));
    inputRef.current?.focus();
  }

  // ============================================================
  // FINALIZAR PARTIDA
  // ============================================================

  async function finishGame() {
    setErrorMessage("");

    try {
      await Promise.all(pendingSaves.current);
    } catch (error) {
      console.error("Error esperando sincronización:", error);
    }

    if (failedSaves.current.length > 0) {
      const retryPayloads = [...failedSaves.current];
      failedSaves.current = [];

      const retryResults = await Promise.all(
        retryPayloads.map((payload) => trySave(payload))
      );

      const stillFailed = retryResults.some((result) => !result.success);

      if (stillFailed) {
        retryResults.forEach((result, resultIndex) => {
          if (!result.success) {
            failedSaves.current.push(retryPayloads[resultIndex]);
          }
        });

        setErrorMessage(
          "No se han podido sincronizar todas las respuestas. Comprueba tu conexión y vuelve a pulsar VER RESULTADO."
        );

        return;
      }
    }

    setSyncWarning("");

    const result = await completeGame(gameId);

    if (!result.success) {
      setErrorMessage("No se pudo finalizar la partida.");
      return;
    }

    setFinished(true);
  }

  // ============================================================
  // SIGUIENTE PALABRA
  // ============================================================

  function handleNext() {
    if (isLast) {
      startTransition(async () => {
        await finishGame();
      });
      return;
    }

    setIndex((current) => current + 1);
    setAnswer("");
    setFeedback(null);
    setErrorMessage("");
    setAlmostWarning(false);
    setHintLevel(0);

    almostUsedRef.current = false;
    answerLockedRef.current = false;

    setTimeout(() => {
      inputRef.current?.focus();
    }, 30);
  }

  // ============================================================
  // PANTALLA FINAL
  // ============================================================

  if (finished || !currentWord) {
    const answered = correct + incorrect;

    const percentage =
      answered === 0 ? 0 : Math.round((correct / answered) * 100);

    const mistakes = sessionResults.filter((result) => !result.isCorrect);

    return (
      <main className="app-shell bg-slate-50">
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-7">
            <div className="text-4xl">
              {percentage >= 85 ? "🏆" : percentage >= 50 ? "🎉" : "💪"}
            </div>

            <h1 className="mt-4 text-3xl font-bold text-slate-900">
              Partida terminada
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {finalMessage(percentage)}
            </p>

            {/* Anillo de porcentaje */}
            <div className="relative mx-auto mt-7 h-36 w-36">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  strokeWidth="12"
                  className="stroke-slate-100"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  strokeWidth="12"
                  strokeLinecap="round"
                  className={
                    percentage >= 65
                      ? "stroke-green-500"
                      : percentage >= 40
                        ? "stroke-amber-500"
                        : "stroke-red-500"
                  }
                  strokeDasharray={`${(percentage / 100) * 326.7} 326.7`}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-slate-900">
                  {percentage}%
                </span>
                <span className="text-xs text-slate-500">de aciertos</span>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-green-50 p-4">
                <div className="text-2xl font-bold text-green-700">
                  {correct}
                </div>
                <div className="mt-1 text-xs text-green-700">Correctas</div>
              </div>

              <div className="rounded-2xl bg-red-50 p-4">
                <div className="text-2xl font-bold text-red-700">
                  {incorrect}
                </div>
                <div className="mt-1 text-xs text-red-700">Errores</div>
              </div>

              <div className="rounded-2xl bg-amber-50 p-4">
                <div className="text-2xl font-bold text-amber-700">
                  {bestStreak}
                </div>
                <div className="mt-1 text-xs text-amber-700">Mejor racha</div>
              </div>
            </div>

            <p className="mt-5 text-sm text-slate-500">
              {answered} de {totalWords} palabras practicadas
              {hintsUsed > 0 &&
                ` · ${hintsUsed} ${hintsUsed === 1 ? "pista" : "pistas"}`}
            </p>

            {/* Fallos de esta sesión */}
            {mistakes.length > 0 && (
              <div className="mt-6 text-left">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Para repasar
                </p>

                <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200">
                  {mistakes.map((mistake, mistakeIndex) => (
                    <li
                      key={`${mistake.prompt}-${mistakeIndex}`}
                      className="flex items-start justify-between gap-3 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">
                          {mistake.prompt}
                        </p>
                        <p className="text-sm text-green-700">
                          {mistake.correctAnswers.slice(0, 3).join(" / ")}
                        </p>
                        {!mistake.skipped && (
                          <p className="text-xs text-red-500 line-through">
                            {mistake.userAnswer}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => speakEnglish(mistake.english)}
                        className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1.5 text-sm"
                        aria-label={`Escuchar ${mistake.english}`}
                      >
                        🔊
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
                        incorrect === 1 ? "ERROR" : "ERRORES"
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
  // JUEGO
  // ============================================================

  const progress = Math.min(
    100,
    ((currentNumber - (feedback ? 0 : 1)) / Math.max(1, totalWords)) * 100
  );

  const otherValidAnswers =
    feedback?.isCorrect && feedback.matched
      ? feedback.correctAnswers.filter((item) => item !== feedback.matched)
      : [];

  const showListenButton = direction === "en_to_es" || Boolean(feedback);

  return (
    <main className="app-shell bg-slate-50">
      <div className="mx-auto w-full max-w-md">
        {/* CABECERA */}

        <div className="mb-4 flex items-center justify-between gap-3">
          <Link
            href="/protected"
            className="text-sm font-medium text-slate-500"
            title="Tu progreso se guarda: puedes continuar más tarde."
          >
            ← Salir
          </Link>

          <div className="flex items-center gap-2">
            {streak >= 3 && (
              <span className="animate-pop rounded-full bg-amber-100 px-3 py-2 text-sm font-bold text-amber-700">
                🔥 {streak}
              </span>
            )}

            <button
              type="button"
              onClick={toggleAutoSpeak}
              className="rounded-full bg-white px-3 py-2 text-sm shadow-sm"
              aria-label={
                autoSpeak
                  ? "Desactivar pronunciación automática"
                  : "Activar pronunciación automática"
              }
              title={
                autoSpeak
                  ? "Pronunciación automática activada"
                  : "Pronunciación automática desactivada"
              }
            >
              {autoSpeak ? "🔊" : "🔇"}
            </button>

            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
              {currentNumber} / {totalWords}
            </span>
          </div>
        </div>

        {/* BARRA DE PROGRESO */}

        <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full bg-slate-900 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* TARJETA PRINCIPAL */}

        <section
          className={`rounded-3xl border bg-white p-5 shadow-sm transition-colors sm:p-7 ${
            feedback
              ? feedback.isCorrect
                ? "border-green-300"
                : "border-red-300"
              : "border-slate-200"
          } ${animation === "shake" ? "animate-shake" : ""} ${
            animation === "pop" ? "animate-pop" : ""
          }`}
        >
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
            {direction === "en_to_es"
              ? "🇬🇧 → 🇪🇸 Traduce al español"
              : "🇪🇸 → 🇬🇧 Traduce al inglés"}
          </p>

          <h1 className="mt-6 break-words text-center text-3xl font-bold text-slate-900 sm:text-4xl">
            {promptText}
          </h1>

          {/* PRONUNCIACIÓN */}

          <div className="mt-5 flex min-h-9 justify-center">
            {showListenButton && (
              <button
                type="button"
                onClick={() => speakEnglish(currentWord.english)}
                className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition active:scale-95"
              >
                🔊 Escuchar
                {direction === "es_to_en" && feedback
                  ? ` «${currentWord.english}»`
                  : ""}
              </button>
            )}
          </div>

          {/* RESPUESTA */}

          <form onSubmit={handleSubmit} className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="game-answer"
                className="block text-sm font-semibold text-slate-700"
              >
                Tu respuesta
              </label>

              {!feedback && maxHint > 0 && (
                <button
                  type="button"
                  onClick={handleHint}
                  disabled={hintLevel >= maxHint}
                  className="text-sm font-semibold text-amber-600 disabled:opacity-40"
                >
                  💡 {hintLevel === 0 ? "Pista" : "Otra letra"}
                </button>
              )}
            </div>

            {hintLevel > 0 && !feedback && (
              <p className="mb-2 rounded-xl bg-amber-50 px-3 py-2 text-center font-mono text-lg tracking-wide text-amber-800">
                {buildHint(hintTarget, hintLevel)}
              </p>
            )}

            <input
              ref={inputRef}
              id="game-answer"
              type="text"
              value={
                feedback?.skipped ? "" : answer
              }
              readOnly={Boolean(feedback)}
              onChange={(event) => {
                setAnswer(event.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              placeholder={
                feedback?.skipped
                  ? "Sin respuesta"
                  : direction === "en_to_es"
                    ? "Escribe en español…"
                    : "Write in English…"
              }
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint={feedback ? "next" : "done"}
              autoFocus
              className={`w-full rounded-2xl border px-4 py-3.5 text-base outline-none transition focus:ring-2 ${
                feedback
                  ? feedback.isCorrect
                    ? "border-green-400 bg-green-50 text-green-800 focus:ring-green-600/10"
                    : "border-red-300 bg-red-50 text-red-800 line-through decoration-red-400 focus:ring-red-600/10"
                  : almostWarning
                    ? "border-amber-400 focus:border-amber-500 focus:ring-amber-500/10"
                    : "border-slate-300 focus:border-slate-900 focus:ring-slate-900/5"
              }`}
            />

            {almostWarning && !feedback && (
              <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
                🤏 ¡Casi! Revisa la ortografía y vuelve a intentarlo.
              </p>
            )}

            {errorMessage && (
              <p className="mt-3 text-sm font-medium text-red-600">
                {errorMessage}
              </p>
            )}

            {!feedback && (
              <div className="mt-5 grid grid-cols-[auto_1fr] gap-3">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="rounded-2xl border border-slate-300 px-4 py-4 text-sm font-semibold text-slate-600 transition active:scale-[0.99]"
                >
                  No lo sé
                </button>

                <button
                  type="submit"
                  className="rounded-2xl bg-slate-900 px-5 py-4 font-bold text-white transition active:scale-[0.99]"
                >
                  COMPROBAR
                </button>
              </div>
            )}

            {/* RESULTADO */}

            {feedback && (
              <div className="mt-5">
                {feedback.isCorrect ? (
                  <div className="rounded-2xl bg-green-50 p-5 text-center">
                    <div className="text-2xl font-bold text-green-700">
                      ✓ ¡CORRECTO!
                    </div>

                    {otherValidAnswers.length > 0 && (
                      <p className="mt-2 text-sm text-green-700">
                        También vale:{" "}
                        <span className="font-semibold">
                          {otherValidAnswers.join(" / ")}
                        </span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-red-50 p-5 text-center">
                    <div className="text-2xl font-bold text-red-700">
                      {feedback.skipped
                        ? "La respuesta era…"
                        : feedback.wasAlmost
                          ? "✕ Casi, pero no"
                          : "✕ ERROR"}
                    </div>

                    {!feedback.skipped && (
                      <p className="mt-3 text-sm text-red-700">
                        Respuesta correcta:
                      </p>
                    )}

                    <p className="mt-1 text-xl font-bold text-red-800">
                      {feedback.correctAnswers.join(" / ")}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPending}
                  className="mt-5 w-full rounded-2xl bg-slate-900 px-5 py-4 font-bold text-white transition active:scale-[0.99] disabled:opacity-50"
                >
                  {isPending
                    ? "Guardando..."
                    : isLast
                      ? "VER RESULTADO"
                      : "SIGUIENTE PALABRA"}
                </button>

                <p className="mt-2 hidden text-center text-xs text-slate-400 sm:block">
                  Pulsa Enter para continuar
                </p>
              </div>
            )}
          </form>
        </section>

        {/* MARCADOR */}

        <div className="mt-5 flex justify-center gap-6 text-sm">
          <span className="font-semibold text-green-700">✓ {correct}</span>
          <span className="font-semibold text-red-700">✕ {incorrect}</span>
        </div>

        {syncWarning && (
          <p className="mt-3 text-center text-xs text-amber-600">
            {syncWarning}
          </p>
        )}
      </div>
    </main>
  );
}
