export type ApiWordEntry = {
  id: string;
  word: string;
  phonemes: string[];
  hint: string | null;
  notes: string | null;
};

export type ApiWordList = {
  id: string;
  name: string;
  description: string | null;
  source: string | null;
  words: ApiWordEntry[];
  createdAt: string;
  updatedAt: string;
};

export type ApiActivityConfig = {
  id: string;
  name: string;
  type: "WORDLE" | "WORD_SEARCH";
  difficulty: "EASY" | "MEDIUM" | "HARD" | "CUSTOM";
  settings: Record<string, unknown>;
  wordListId: string;
  createdAt: string;
  updatedAt: string;
  wordList?: ApiWordList;
  generatedOutputs?: ApiGeneratedOutput[];
};

export type ApiGeneratedOutput = {
  id: string;
  filename: string;
  html: string;
  activityId: string;
  createdAt: string;
};

type WordListsResponse = {
  wordLists: ApiWordList[];
};

type WordListResponse = {
  wordList: ApiWordList;
};

type ActivitiesResponse = {
  activities: ApiActivityConfig[];
};

type ActivityConfigResponse = {
  activity: ApiActivityConfig;
};

type GeneratedOutputResponse = {
  output: ApiGeneratedOutput;
};

export type WordListPayload = {
  name: string;
  description?: string | null;
  source?: string | null;
  words: {
    word: string;
    phonemes: string[];
    hint?: string | null;
    notes?: string | null;
  }[];
};

export type ActivityConfigPayload = {
  name: string;
  type: ApiActivityConfig["type"];
  difficulty: ApiActivityConfig["difficulty"];
  wordListId: string;
  settings: Record<string, unknown>;
};

export type GeneratedOutputPayload = {
  filename: string;
  html: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4080";

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function sendJson<T>(
  path: string,
  method: "POST" | "PUT" | "DELETE",
  body?: unknown,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export async function fetchWordLists() {
  const data = await fetchJson<WordListsResponse>("/word-lists");
  return data.wordLists;
}

export async function fetchActivityConfigs() {
  const data = await fetchJson<ActivitiesResponse>("/activities");
  return data.activities;
}

export async function createWordList(payload: WordListPayload) {
  const data = await sendJson<WordListResponse>("/word-lists", "POST", payload);
  return data.wordList;
}

export async function deleteWordList(id: string) {
  await sendJson<void>(`/word-lists/${encodeURIComponent(id)}`, "DELETE");
}

export async function deleteActivityConfig(id: string) {
  await sendJson<void>(`/activities/${encodeURIComponent(id)}`, "DELETE");
}

export async function createActivityConfig(payload: ActivityConfigPayload) {
  const data = await sendJson<ActivityConfigResponse>(
    "/activities",
    "POST",
    payload,
  );
  return data.activity;
}

export async function createGeneratedOutput(
  activityId: string,
  payload: GeneratedOutputPayload,
) {
  const data = await sendJson<GeneratedOutputResponse>(
    `/activities/${encodeURIComponent(activityId)}/outputs`,
    "POST",
    payload,
  );
  return data.output;
}
