"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  ApiActivityConfig,
  ApiWordList,
  createWordList,
  deleteActivityConfig,
  deleteWordList,
  fetchActivityConfigs,
  fetchWordLists,
  getApiBaseUrl,
  WordListPayload,
} from "@/lib/apiClient";
import { downloadHtml } from "@/lib/htmlGenerators";

type LoadState = "idle" | "loading" | "ready" | "error";

const exampleWordList = `thin | θ ɪ n | TH as in thin
ship | ʃ ɪ p | SH as in ship
tin | t ɪ n`;

function parseWordRows(value: string): WordListPayload["words"] {
  return value
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => {
      const [wordValue, phonemeValue, hintValue, notesValue] = row
        .split("|")
        .map((part) => part.trim());

      const phonemes = (phonemeValue ?? "")
        .split(/[,\s]+/)
        .map((phoneme) => phoneme.trim())
        .filter(Boolean);

      return {
        word: wordValue ?? "",
        phonemes,
        hint: hintValue || null,
        notes: notesValue || null,
      };
    });
}

export function SavedDataPanel() {
  const [wordLists, setWordLists] = useState<ApiWordList[]>([]);
  const [activities, setActivities] = useState<ApiActivityConfig[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [message, setMessage] = useState("");
  const [listName, setListName] = useState("HCE practice list");
  const [description, setDescription] = useState(
    "Teacher-created phoneme practice words.",
  );
  const [source, setSource] = useState("Classroom entry");
  const [wordRows, setWordRows] = useState(exampleWordList);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadSavedData = useCallback(async (successMessage = "") => {
    setState("loading");

    try {
      const [loadedWordLists, loadedActivities] = await Promise.all([
        fetchWordLists(),
        fetchActivityConfigs(),
      ]);

      setWordLists(loadedWordLists);
      setActivities(loadedActivities);
      setState("ready");
      setMessage(successMessage);
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not connect to the backend API.",
      );
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadInitialData() {
      try {
        const [loadedWordLists, loadedActivities] = await Promise.all([
          fetchWordLists(),
          fetchActivityConfigs(),
        ]);

        if (!active) {
          return;
        }

        setWordLists(loadedWordLists);
        setActivities(loadedActivities);
        setState("ready");
        setMessage("");
      } catch (error) {
        if (!active) {
          return;
        }

        setState("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Could not connect to the backend API.",
        );
      }
    }

    loadInitialData();

    return () => {
      active = false;
    };
  }, []);

  async function handleSaveWordList(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const words = parseWordRows(wordRows);
    const incompleteRow = words.find(
      (word) => !word.word || word.phonemes.length === 0,
    );

    if (!listName.trim()) {
      setState("error");
      setMessage("Word list name is required");
      return;
    }

    if (words.length === 0 || incompleteRow) {
      setState("error");
      setMessage("Each word row needs a word and at least one phoneme");
      return;
    }

    setIsSaving(true);

    try {
      await createWordList({
        name: listName.trim(),
        description: description.trim() || null,
        source: source.trim() || null,
        words,
      });

      await loadSavedData("Word list saved");
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error ? error.message : "Could not save the word list.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteWordList(id: string) {
    setDeletingId(id);

    try {
      await deleteWordList(id);
      await loadSavedData("Word list deleted");
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not delete the word list.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteActivity(id: string) {
    setDeletingId(id);

    try {
      await deleteActivityConfig(id);
      await loadSavedData("Activity configuration deleted");
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not delete the activity configuration.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="mx-auto grid max-w-6xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[0.85fr_1.15fr]">
      <aside className="grid gap-5">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-2xl font-bold text-slate-950">
              Backend connection
            </h2>
            <button
              type="button"
              onClick={() => loadSavedData()}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>
          <dl className="mt-4 grid gap-3 text-sm text-slate-700">
            <div>
              <dt className="font-bold text-slate-900">API base URL</dt>
              <dd className="break-all font-mono">{getApiBaseUrl()}</dd>
            </div>
            <div>
              <dt className="font-bold text-slate-900">Status</dt>
              <dd>
                {state === "loading"
                  ? "Loading saved data"
                  : state === "ready"
                    ? "Connected"
                    : state === "error"
                      ? "Backend unavailable"
                      : "Waiting"}
              </dd>
            </div>
          </dl>
          {message ? (
            <p
              className={`mt-4 rounded-md border p-3 text-sm font-semibold ${
                state === "error"
                  ? "border-amber-300 bg-amber-50 text-amber-900"
                  : "border-teal-300 bg-teal-50 text-teal-900"
              }`}
            >
              {message}
              {state === "error"
                ? ". The frontend builders still work with their local Assessment 1 data while the API is offline."
                : ""}
            </p>
          ) : null}
        </section>

        <form
          onSubmit={handleSaveWordList}
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-slate-950">Save word list</h2>
          <div className="mt-4 grid gap-3">
            <label className="grid gap-1 text-sm font-bold text-slate-900">
              Name
              <input
                value={listName}
                onChange={(event) => setListName(event.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2 font-normal text-slate-900"
              />
            </label>
            <label className="grid gap-1 text-sm font-bold text-slate-900">
              Description
              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2 font-normal text-slate-900"
              />
            </label>
            <label className="grid gap-1 text-sm font-bold text-slate-900">
              Source
              <input
                value={source}
                onChange={(event) => setSource(event.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2 font-normal text-slate-900"
              />
            </label>
            <label className="grid gap-1 text-sm font-bold text-slate-900">
              Words
              <textarea
                value={wordRows}
                onChange={(event) => setWordRows(event.target.value)}
                rows={7}
                className="rounded-md border border-slate-300 px-3 py-2 font-mono text-sm font-normal text-slate-900"
              />
            </label>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Format: word | phonemes separated by spaces | optional hint.
          </p>
          <button
            type="submit"
            disabled={isSaving}
            className="mt-4 rounded-md bg-teal-700 px-4 py-2 text-sm font-bold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSaving ? "Saving..." : "Save to database"}
          </button>
        </form>
      </aside>

      <div className="grid gap-5">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">Saved word lists</h2>
              <p className="text-sm text-slate-600">
                Data loaded from <code>/word-lists</code>.
              </p>
            </div>
            <span className="text-sm font-bold text-teal-700">
              {wordLists.length} saved
            </span>
          </div>

          <div className="mt-5 grid gap-3">
            {state === "loading" ? (
              <p className="text-sm text-slate-700">Loading word lists...</p>
            ) : wordLists.length > 0 ? (
              wordLists.map((list) => (
                <article
                  key={list.id}
                  className="rounded-md border border-slate-200 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-bold text-slate-950">{list.name}</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {list.words.length} words
                        {list.description ? ` | ${list.description}` : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteWordList(list.id)}
                      disabled={deletingId === list.id}
                      className="w-fit rounded-md border border-red-300 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
                    >
                      {deletingId === list.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    Source: {list.source ?? "Not recorded"}
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    {list.words
                      .slice(0, 4)
                      .map((word) => word.phonemes.join(" "))
                      .join(" / ")}
                  </p>
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-700">
                No saved word lists are available yet.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                Saved activity configurations
              </h2>
              <p className="text-sm text-slate-600">
                Data loaded from <code>/activities</code>.
              </p>
            </div>
            <span className="text-sm font-bold text-teal-700">
              {activities.length} saved
            </span>
          </div>

          <div className="mt-5 grid gap-3">
            {state === "loading" ? (
              <p className="text-sm text-slate-700">Loading activities...</p>
            ) : activities.length > 0 ? (
              activities.map((activity) => (
                <article
                  key={activity.id}
                  className="rounded-md border border-slate-200 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-bold text-slate-950">
                        {activity.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {activity.type.replace("_", " ")} |{" "}
                        {activity.difficulty}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteActivity(activity.id)}
                      disabled={deletingId === activity.id}
                      className="w-fit rounded-md border border-red-300 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
                    >
                      {deletingId === activity.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    Word list: {activity.wordList?.name ?? activity.wordListId}
                  </p>
                  {activity.generatedOutputs?.length ? (
                    <div className="mt-3 grid gap-2 rounded-md bg-slate-50 p-3">
                      <p className="text-sm font-bold text-slate-900">
                        Stored HTML outputs
                      </p>
                      {activity.generatedOutputs.map((output) => (
                        <div
                          key={output.id}
                          className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <span className="break-all text-sm text-slate-700">
                            {output.filename}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              downloadHtml(output.filename, output.html)
                            }
                            className="w-fit rounded-md border border-slate-300 px-3 py-2 text-sm font-bold text-slate-800 hover:bg-white"
                          >
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">
                      No generated HTML stored yet.
                    </p>
                  )}
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-700">
                No saved activity configurations are available yet.
              </p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
