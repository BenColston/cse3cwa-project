export type ApiWordEntry = {
  id: string;
  word: string;
  phonemes: string[];
  hint: string | null;
  notes: string | null;
};

export type ApiWordList = {
  simulationBatchId?: string | null;
  id: string;
  name: string;
  description: string | null;
  source: string | null;
  words: ApiWordEntry[];
  createdAt: string;
  updatedAt: string;
};

export type ApiActivityConfig = {
  simulationBatchId?: string | null;
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

export type UsageEventPayload = {
  eventType:
    | "PAGE_VIEW"
    | "ACTIVITY_USED"
    | "GENERATION_SUCCEEDED"
    | "GENERATION_FAILED";
  activityType?: ApiActivityConfig["type"];
  durationMs?: number;
};

export type ApiMetrics = {
  source?: "recorded" | "simulated";
  simulationAvailable?: boolean;
  wordLists: number;
  activitiesCreated: number;
  activitiesCreatedByType: Record<ApiActivityConfig["type"], number>;
  activityUsageByType: { type: ApiActivityConfig["type"]; count: number }[];
  mostUsedActivityType: ApiActivityConfig["type"] | null;
  successfulGenerations: number;
  failedGenerations: number;
  totalGeneratedOutputs: number;
  averageTimeOnPageMs: number;
  pagesMeasured: number;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4080";

async function errorMessageFor(response: Response) {
  try {
    const data = (await response.json()) as { error?: unknown };

    if (typeof data.error === "string") {
      return data.error;
    }
  } catch {
    // Fall through to the generic status message.
  }

  return `Request failed with status ${response.status}`;
}

async function fetchJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    signal,
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(await errorMessageFor(response));
  }

  return response.json() as Promise<T>;
}

async function sendJson<T>(
  path: string,
  method: "POST" | "PUT" | "DELETE",
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    signal,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await errorMessageFor(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function fetchMetrics(signal?: AbortSignal, source: "recorded" | "simulated" = "recorded") {
  return fetchJson<ApiMetrics>(source === "recorded" ? "/metrics" : "/metrics?source=simulated", signal);
}

export function manageSimulation(method: "POST" | "DELETE") {
  return sendJson<{ message: string }>("/simulation", method, undefined, AbortSignal.timeout(10000));
}

export async function fetchApiHealth(signal?: AbortSignal) {
  const health = await fetchJson<{ status: string; service: string }>("/health", signal);
  if (health.status !== "ok") {
    throw new Error("API health check did not report ok.");
  }
  return health;
}

export async function recordUsageEvent(
  payload: UsageEventPayload,
  keepalive = false,
) {
  try {
    await fetch(`${API_BASE_URL}/metrics/events`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      keepalive,
    });
  } catch {
    // Analytics must not interrupt the builder if the API is unavailable.
  }
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
