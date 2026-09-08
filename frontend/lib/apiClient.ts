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
};

type WordListsResponse = {
  wordLists: ApiWordList[];
};

type ActivitiesResponse = {
  activities: ApiActivityConfig[];
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
