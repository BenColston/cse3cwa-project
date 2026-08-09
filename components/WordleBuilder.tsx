"use client";

import { useMemo, useState } from "react";
import { DownloadButton } from "@/components/DownloadButton";
import { WordlePreview } from "@/components/WordlePreview";
import {
  corpusWords,
  wordleActivity,
  type CorpusWord,
} from "@/lib/activityData";
import { generateWordleHtml } from "@/lib/htmlGenerators";

const difficulties: CorpusWord["difficulty"][] = [
  "3 phonemes",
  "4 phonemes",
  "5 phonemes",
];

function filenameForWord(word: CorpusWord) {
  return `phoneme-wordle-${word.english}-${word.phonemes.length}-phonemes.html`;
}

export function WordleBuilder() {
  const [difficulty, setDifficulty] =
    useState<CorpusWord["difficulty"]>("3 phonemes");
  const [targetEnglish, setTargetEnglish] = useState(wordleActivity.target.english);

  const availableWords = useMemo(
    () => corpusWords.filter((word) => word.difficulty === difficulty),
    [difficulty],
  );
  const target =
    availableWords.find((word) => word.english === targetEnglish) ??
    availableWords[0] ??
    wordleActivity.target;

  function chooseDifficulty(nextDifficulty: CorpusWord["difficulty"]) {
    const firstWord = corpusWords.find(
      (word) => word.difficulty === nextDifficulty,
    );
    setDifficulty(nextDifficulty);
    setTargetEnglish(firstWord?.english ?? wordleActivity.target.english);
  }

  return (
    <section className="mx-auto grid max-w-6xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[1.2fr_0.8fr]">
      <WordlePreview
        key={target.english}
        target={target}
        title={wordleActivity.title}
        maxGuesses={wordleActivity.maxGuesses}
      />

      <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-950">Builder settings</h2>
        <div className="mt-5 grid gap-5">
          <fieldset>
            <legend className="text-sm font-bold uppercase tracking-wide text-slate-600">
              Difficulty
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {difficulties.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => chooseDifficulty(option)}
                  className={`rounded-md border px-4 py-2 text-sm font-bold ${
                    difficulty === option
                      ? "border-teal-700 bg-teal-700 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="grid gap-2 text-sm font-bold uppercase tracking-wide text-slate-600">
            Target word
            <select
              value={target.english}
              onChange={(event) => setTargetEnglish(event.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-base font-semibold normal-case tracking-normal text-slate-950 focus:outline-none focus:ring-4 focus:ring-amber-300"
            >
              {availableWords.map((word) => (
                <option key={word.english} value={word.english}>
                  {word.english} - /{word.phonemes.join("/ /")}/
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p>
              Selected target:{" "}
              <strong className="text-slate-950">{target.english}</strong>
            </p>
            <p className="mt-2">
              Phoneme sequence:{" "}
              <strong className="text-slate-950">
                /{target.phonemes.join("/ /")}/
              </strong>
            </p>
          </div>

          <div className="grid gap-3 text-sm text-slate-700">
            <p>
              The generated file uses this selected corpus word, the HCE
              phoneme keyboard, hover hints, Wordle-style feedback, and the
              English equivalence after a correct answer.
            </p>
            <DownloadButton
              filename={filenameForWord(target)}
              html={generateWordleHtml({ ...wordleActivity, target })}
            />
          </div>
        </div>
      </aside>
    </section>
  );
}
