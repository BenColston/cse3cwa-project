"use client";

import { useEffect, useMemo, useState } from "react";
import { DownloadButton } from "@/components/DownloadButton";
import { WordSearchPreview } from "@/components/WordSearchPreview";
import { wordSearchWords } from "@/lib/activityData";
import { ApiWordList, fetchWordLists, getApiBaseUrl } from "@/lib/apiClient";
import { generateWordSearchHtml } from "@/lib/htmlGenerators";
import { wordListToCorpusWords } from "@/lib/savedWordLists";

export function WordSearchBuilder() {
  const [savedLists, setSavedLists] = useState<ApiWordList[]>([]);
  const [selectedListId, setSelectedListId] = useState("local");
  const [savedListMessage, setSavedListMessage] = useState(
    "Loading saved word lists...",
  );

  useEffect(() => {
    let active = true;

    async function loadLists() {
      try {
        const lists = await fetchWordLists();

        if (!active) {
          return;
        }

        setSavedLists(lists);
        setSavedListMessage(
          lists.length > 0
            ? `Loaded ${lists.length} saved word list${lists.length === 1 ? "" : "s"}.`
            : "No saved backend word lists yet.",
        );
      } catch {
        if (!active) {
          return;
        }

        setSavedListMessage(
          `Backend unavailable at ${getApiBaseUrl()}; using the local corpus.`,
        );
      }
    }

    loadLists();

    return () => {
      active = false;
    };
  }, []);

  const selectedSavedList = savedLists.find((list) => list.id === selectedListId);
  const activeWords = useMemo(
    () =>
      selectedSavedList && selectedSavedList.words.length > 0
        ? wordListToCorpusWords(selectedSavedList)
        : wordSearchWords,
    [selectedSavedList],
  );
  const sourceName = selectedSavedList?.name ?? "Local HCE corpus";

  return (
    <section className="mx-auto grid max-w-6xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[1.2fr_0.8fr]">
      <WordSearchPreview
        key={selectedListId}
        words={activeWords}
        sourceName={sourceName}
      />
      <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-950">Output settings</h2>
        <div className="mt-4 grid gap-5 text-sm text-slate-700">
          <label className="grid gap-2 text-sm font-bold uppercase tracking-wide text-slate-600">
            Word source
            <select
              value={selectedListId}
              onChange={(event) => setSelectedListId(event.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-base font-semibold normal-case tracking-normal text-slate-950 focus:outline-none focus:ring-4 focus:ring-amber-300"
            >
              <option value="local">Local HCE corpus</option>
              {savedLists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name} ({list.words.length} words)
                </option>
              ))}
            </select>
          </label>
          <p className="text-sm text-slate-600">{savedListMessage}</p>
          <p>
            The generated file contains editable phoneme word input, grid size
            controls, puzzle generation, answer highlighting, and a phoneme word
            list. Saved backend lists can drive the downloadable activity when
            the API is available.
          </p>
          <DownloadButton
            filename={`phoneme-word-search-${sourceName.toLowerCase().replaceAll(/\W+/g, "-")}.html`}
            html={generateWordSearchHtml(activeWords)}
          />
        </div>
      </aside>
    </section>
  );
}
