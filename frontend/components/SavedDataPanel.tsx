"use client";

import { useEffect, useState } from "react";
import {
  ApiActivityConfig,
  ApiWordList,
  fetchActivityConfigs,
  fetchWordLists,
  getApiBaseUrl,
} from "@/lib/apiClient";

type LoadState = "idle" | "loading" | "ready" | "error";

export function SavedDataPanel() {
  const [wordLists, setWordLists] = useState<ApiWordList[]>([]);
  const [activities, setActivities] = useState<ApiActivityConfig[]>([]);
  const [state, setState] = useState<LoadState>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSavedData() {
      setState("loading");

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

    loadSavedData();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="mx-auto grid max-w-6xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[0.85fr_1.15fr]">
      <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-950">Backend connection</h2>
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
        {state === "error" ? (
          <p className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
            {message}. The frontend builders still work with their local
            Assessment 1 data while the API is offline.
          </p>
        ) : null}
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
                  <h3 className="font-bold text-slate-950">{list.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {list.words.length} words
                    {list.description ? ` | ${list.description}` : ""}
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
                  <h3 className="font-bold text-slate-950">{activity.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {activity.type.replace("_", " ")} | {activity.difficulty}
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    Word list: {activity.wordList?.name ?? activity.wordListId}
                  </p>
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
