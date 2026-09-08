import { ActivityType, DifficultyLevel, Prisma } from "@prisma/client";

export type ActivityConfigInput = {
  name: string;
  type: ActivityType;
  difficulty: DifficultyLevel;
  wordListId: string;
  settings: Prisma.InputJsonValue;
};

type ValidationResult =
  | { ok: true; data: ActivityConfigInput }
  | { ok: false; error: string };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isJsonValue(value: unknown): value is Prisma.InputJsonValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(isJsonValue);
  }

  if (isObject(value)) {
    return Object.values(value).every(isJsonValue);
  }

  return false;
}

function isActivityType(value: unknown): value is ActivityType {
  return (
    typeof value === "string" &&
    Object.values(ActivityType).includes(value as ActivityType)
  );
}

function isDifficultyLevel(value: unknown): value is DifficultyLevel {
  return (
    typeof value === "string" &&
    Object.values(DifficultyLevel).includes(value as DifficultyLevel)
  );
}

export function validateActivityConfigInput(
  input: unknown,
): ValidationResult {
  if (!isObject(input)) {
    return { ok: false, error: "Request body must be an object." };
  }

  if (typeof input.name !== "string" || input.name.trim().length === 0) {
    return { ok: false, error: "Activity name is required." };
  }

  if (!isActivityType(input.type)) {
    return {
      ok: false,
      error: "Activity type must be WORDLE or WORD_SEARCH.",
    };
  }

  if (!isDifficultyLevel(input.difficulty)) {
    return {
      ok: false,
      error: "Difficulty must be EASY, MEDIUM, HARD, or CUSTOM.",
    };
  }

  if (
    typeof input.wordListId !== "string" ||
    input.wordListId.trim().length === 0
  ) {
    return { ok: false, error: "wordListId is required." };
  }

  if (!isObject(input.settings) || !isJsonValue(input.settings)) {
    return {
      ok: false,
      error: "Activity settings must be a JSON-compatible object.",
    };
  }

  return {
    ok: true,
    data: {
      name: input.name.trim(),
      type: input.type,
      difficulty: input.difficulty,
      wordListId: input.wordListId.trim(),
      settings: input.settings,
    },
  };
}
