"use client";

import { useEffect, useState } from "react";
import { DownloadButton } from "@/components/DownloadButton";
import { WordSearchPreview } from "@/components/WordSearchPreview";
import { wordSearchWords } from "@/lib/activityData";
import {
  ApiWordList,
  createActivityConfig,
  fetchWordLists,
  getApiBaseUrl,
} from "@/lib/apiClient";
import { generateWordSearchHtml } from "@/lib/htmlGenerators";
import { wordListToCorpusWords } from "@/lib/savedWordLists";

export function WordSearchBuilder() {
  const [savedLists, setSavedLists] = useState<ApiWordList[]>([]);
  const [selectedListId, setSelectedListId] = useState("local");
  const [savedListMessage, setSavedListMessage] = useState(
    "Loading saved word lists...",
  );
  const [rows, setRows] = useState(8);
  const [cols, setCols] = useState(8);
  const [configName, setConfigName] = useState("Word Search classroom activity");
  const [configMessage, setConfigMessage] = useState("");
  const [isSavingConfig, setIsSavingConfig] = useState(false);

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
  const activeWords =
    selectedSavedList && selectedSavedList.words.length > 0
      ? wordListToCorpusWords(selectedSavedList)
      : wordSearchWords;
  const sourceName = selectedSavedList?.name ?? "Local HCE corpus";

  async function saveConfiguration() {
    if (!selectedSavedList) {
      setConfigMessage("Choose a saved backend word list before saving a configuration.");
      return;
    }

    if (!configName.trim()) {
      setConfigMessage("Configuration name is required.");
      return;
    }

    setIsSavingConfig(true);

    try {
      await createActivityConfig({
        name: configName.trim(),
        type: "WORD_SEARCH",
        difficulty: "CUSTOM",
        wordListId: selectedSavedList.id,
        settings: {
          rows,
          cols,
          wordCount: activeWords.length,
          sourceName,
        },
      });
      setConfigMessage("Word Search configuration saved.");
    } catch (error) {
      setConfigMessage(
        error instanceof Error
          ? error.message
          : "Could not save the Word Search configuration.",
      );
    } finally {
      setIsSavingConfig(false);
    }
  }

  return (
    <section className="mx-auto grid max-w-6xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[1.2fr_0.8fr]">
      <WordSearchPreview
        key={selectedListId}
        words={activeWords}
        sourceName={sourceName}
        rows={rows}
        cols={cols}
        onRowsChange={setRows}
        onColsChange={setCols}
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
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <label className="grid gap-2 text-sm font-bold uppercase tracking-wide text-slate-600">
              Configuration name
              <input
                value={configName}
                onChange={(event) => setConfigName(event.target.value)}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-base font-semibold normal-case tracking-normal text-slate-950 focus:outline-none focus:ring-4 focus:ring-amber-300"
              />
            </label>
            <button
              type="button"
              onClick={saveConfiguration}
              disabled={isSavingConfig || !selectedSavedList}
              className="mt-3 rounded-md bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSavingConfig ? "Saving..." : "Save configuration"}
            </button>
            {configMessage ? (
              <p className="mt-3 text-sm font-semibold text-slate-700">
                {configMessage}
              </p>
            ) : null}
          </div>
        </div>
      </aside>
    </section>
  );
}
