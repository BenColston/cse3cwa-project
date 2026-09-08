export type GeneratedOutputInput = {
  filename: string;
  html: string;
};

type ValidationResult =
  | { ok: true; data: GeneratedOutputInput }
  | { ok: false; error: string };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateGeneratedOutputInput(
  input: unknown,
): ValidationResult {
  if (!isObject(input)) {
    return { ok: false, error: "Request body must be an object." };
  }

  if (typeof input.filename !== "string" || input.filename.trim().length === 0) {
    return { ok: false, error: "Output filename is required." };
  }

  if (!input.filename.trim().endsWith(".html")) {
    return { ok: false, error: "Output filename must end with .html." };
  }

  if (typeof input.html !== "string" || input.html.trim().length === 0) {
    return { ok: false, error: "Generated HTML is required." };
  }

  if (!input.html.toLowerCase().includes("<!doctype html")) {
    return { ok: false, error: "Generated HTML must include a doctype." };
  }

  return {
    ok: true,
    data: {
      filename: input.filename.trim(),
      html: input.html,
    },
  };
}
