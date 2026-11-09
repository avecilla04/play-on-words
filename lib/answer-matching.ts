// ============================================================
// CORRECCIÓN DE RESPUESTAS
// ============================================================
//
// Reglas (iguales que antes, pero más flexibles con el formato):
// - Ignora mayúsculas, tildes (á é í ó ú ü) y signos de puntuación.
// - La ñ sigue siendo una letra distinta de la n.
// - "rubio/a"            → acepta "rubio" y "rubia".
// - "melocotón/durazno"  → acepta cualquiera de las dos.
// - "buscar (en un diccionario)" → el paréntesis es opcional.
// - Ignora artículos iniciales: "la manzana" = "manzana",
//   "to give up" = "give up", "an apple" = "apple".
// - "it's" = "it is", "don't" = "do not", etc.
//
// La ortografía sigue contando: "beatiful" NO es "beautiful".
// Pero se detectan los casi-aciertos para avisar al jugador.
// ============================================================

export type AnswerLanguage = "es" | "en";

export type MatchResult =
  | { kind: "correct"; matched: string }
  | { kind: "almost"; closest: string }
  | { kind: "wrong" };

const ENGLISH_CONTRACTIONS: [RegExp, string][] = [
  [/\bcan't\b/g, "cannot"],
  [/\bwon't\b/g, "will not"],
  [/\bshan't\b/g, "shall not"],
  [/\b(\w+)n't\b/g, "$1 not"],
  [/\b(it|that|what|there|here|he|she|who|where)'s\b/g, "$1 is"],
  [/\b(\w+)'re\b/g, "$1 are"],
  [/\b(\w+)'ve\b/g, "$1 have"],
  [/\b(\w+)'ll\b/g, "$1 will"],
  [/\bi'm\b/g, "i am"],
  [/\b(\w+)'d\b/g, "$1 would"],
];

const LEADING_ARTICLES: Record<AnswerLanguage, RegExp> = {
  es: /^(el|la|los|las|un|una|unos|unas)\s+/,
  en: /^(the|a|an|to)\s+/,
};

function stripAccents(text: string) {
  return text
    .replaceAll("á", "a")
    .replaceAll("é", "e")
    .replaceAll("í", "i")
    .replaceAll("ó", "o")
    .replaceAll("ú", "u")
    .replaceAll("ü", "u")
    .replaceAll("à", "a")
    .replaceAll("è", "e");
}

export function normalizeAnswer(
  text: string,
  language?: AnswerLanguage
) {
  let result = stripAccents(text.trim().toLowerCase())
    .replace(/[’‘`´]/g, "'")
    .replace(/…/g, "...");

  if (language !== "es") {
    for (const [pattern, replacement] of ENGLISH_CONTRACTIONS) {
      result = result.replace(pattern, replacement);
    }
  }

  result = result
    .replace(/\bcan not\b/g, "cannot")
    .replace(/[-_]/g, " ")
    .replace(/[.,;:!?¡¿"'()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (language) {
    // Puede haber más de un artículo ("to the ...").
    let previous = "";
    while (previous !== result) {
      previous = result;
      result = result.replace(LEADING_ARTICLES[language], "");
    }
  }

  return result;
}

// ------------------------------------------------------------
// Variantes aceptadas de una respuesta guardada
// ------------------------------------------------------------

function expandGender(text: string): string[] {
  // "peluquero/a canino/a" → "peluquero canino", "peluquera canina"
  if (!/\p{L}\/a\b/u.test(text)) {
    return [text];
  }

  const masculine = text.replace(/(\p{L}+)\/a\b/gu, "$1");

  const feminine = text.replace(/(\p{L}+)\/a\b/gu, (_match, word: string) => {
    if (word.endsWith("o")) return `${word.slice(0, -1)}a`;
    if (word.endsWith("ón")) return `${word.slice(0, -2)}ona`;
    if (word.endsWith("án")) return `${word.slice(0, -2)}ana`;
    if (/[rl]$/.test(word)) return `${word}a`;
    return word;
  });

  return masculine === feminine ? [masculine] : [masculine, feminine];
}

function expandParentheses(text: string): string[] {
  if (!text.includes("(")) {
    return [text];
  }

  return [
    text.replace(/\([^)]*\)/g, " "),
    text.replace(/[()]/g, " "),
  ];
}

function expandSlashes(text: string): string[] {
  // Después de expandir el género, las barras que quedan
  // separan alternativas: "melocotón/durazno".
  if (!text.includes("/")) {
    return [text];
  }

  return text.split("/");
}

export function acceptedVariants(
  answer: string,
  language: AnswerLanguage
): string[] {
  const variants = new Set<string>();

  for (const gendered of expandGender(answer)) {
    for (const withoutParens of expandParentheses(gendered)) {
      for (const alternative of expandSlashes(withoutParens)) {
        const normalized = normalizeAnswer(alternative, language);

        if (normalized) {
          variants.add(normalized);
        }
      }
    }
  }

  return Array.from(variants);
}

// ------------------------------------------------------------
// Distancia de edición (para detectar casi-aciertos)
// ------------------------------------------------------------

export function editDistance(a: string, b: string) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i++) {
    const current = [i];

    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + cost
      );

      // Transposición de dos letras ("recieve" → "receive")
      if (
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        current[j] = Math.min(current[j], previous[j - 2] + 1);
      }
    }

    previous = current;
  }

  return previous[b.length];
}

function almostThreshold(length: number) {
  if (length < 4) return 0;
  if (length < 9) return 1;
  return 2;
}

// ------------------------------------------------------------
// Comprobar una respuesta
// ------------------------------------------------------------

export function checkAnswer(
  userAnswer: string,
  correctAnswers: string[],
  language: AnswerLanguage
): MatchResult {
  const normalizedUser = normalizeAnswer(userAnswer, language);

  if (!normalizedUser) {
    return { kind: "wrong" };
  }

  let closest: { answer: string; distance: number } | null = null;

  for (const correctAnswer of correctAnswers) {
    for (const variant of acceptedVariants(correctAnswer, language)) {
      if (variant === normalizedUser) {
        return { kind: "correct", matched: correctAnswer };
      }

      const distance = editDistance(normalizedUser, variant);

      if (
        distance <= almostThreshold(variant.length) &&
        (!closest || distance < closest.distance)
      ) {
        closest = { answer: correctAnswer, distance };
      }
    }
  }

  if (closest) {
    return { kind: "almost", closest: closest.answer };
  }

  return { kind: "wrong" };
}

// ------------------------------------------------------------
// Pista: revela las primeras letras de la respuesta
// ------------------------------------------------------------

export function buildHint(answer: string, revealed: number) {
  // Usamos la primera variante "limpia" (sin barras ni paréntesis)
  const clean =
    expandSlashes(
      expandParentheses(expandGender(answer)[0])[0]
    )[0]
      .replace(/\s+/g, " ")
      .trim();

  let lettersShown = 0;

  // Cada letra separada por un espacio y cada palabra
  // separada por tres: "g _ _ _   u _"
  return clean
    .split(" ")
    .map((word) =>
      word
        .split("")
        .map((char) => {
          if (!/\p{L}/u.test(char)) {
            return char;
          }

          lettersShown += 1;

          return lettersShown <= revealed ? char : "_";
        })
        .join(" ")
    )
    .join("   ");
}

export function countLetters(answer: string) {
  return (answer.match(/\p{L}/gu) ?? []).length;
}
