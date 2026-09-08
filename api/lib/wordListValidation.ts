export type WordEntryInput = {
  word: string;
  phonemes: string[];
  hint?: string | null;
  notes?: string | null;
};

export type WordListInput = {
  name: string;
  description?: string | null;
  source?: string | null;
  words: WordEntryInput[];
};

type ValidationResult =
  | { ok: true; data: WordListInput }
  | { ok: false; error: string };

function optionalText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateWordListInput(input: unknown): ValidationResult {
  if (!isObject(input)) {
    return { ok: false, error: "Request body must be an object." };
  }

  if (typeof input.name !== "string" || input.name.trim().length === 0) {
    return { ok: false, error: "Word list name is required." };
  }

  if (!Array.isArray(input.words) || input.words.length === 0) {
    return { ok: false, error: "At least one word entry is required." };
  }

  const words: WordEntryInput[] = [];

  for (const [index, entry] of input.words.entries()) {
    if (!isObject(entry)) {
      return { ok: false, error: `Word entry ${index + 1} must be an object.` };
    }

    if (typeof entry.word !== "string" || entry.word.trim().length === 0) {
      return { ok: false, error: `Word entry ${index + 1} needs a word.` };
    }

    if (!Array.isArray(entry.phonemes) || entry.phonemes.length === 0) {
      return {
        ok: false,
        error: `Word entry ${index + 1} needs at least one phoneme.`,
      };
    }

    const phonemes = entry.phonemes
      .filter((phoneme): phoneme is string => typeof phoneme === "string")
      .map((phoneme) => phoneme.trim())
      .filter(Boolean);

    if (phonemes.length !== entry.phonemes.length) {
      return {
        ok: false,
        error: `Word entry ${index + 1} has invalid phoneme values.`,
      };
    }

    words.push({
      word: entry.word.trim(),
      phonemes,
      hint: optionalText(entry.hint),
      notes: optionalText(entry.notes),
    });
  }

  return {
    ok: true,
    data: {
      name: input.name.trim(),
      description: optionalText(input.description),
      source: optionalText(input.source),
      words,
    },
  };
}
