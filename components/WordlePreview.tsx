"use client";

import { useMemo, useState } from "react";
import { PhonemeChip } from "@/components/PhonemeChip";
import {
  findPhoneme,
  phonemeKeyboard,
  wordleActivity,
  type CorpusWord,
  type PhonemeToken,
} from "@/lib/activityData";

type SubmittedGuess = {
  phonemes: string[];
  result: ("correct" | "present" | "absent")[];
};

function scoreGuess(guess: string[], target: string[]) {
  return guess.map((phoneme, index) => {
    if (phoneme === target[index]) {
      return "correct";
    }
    return target.includes(phoneme) ? "present" : "absent";
  });
}

function cellClass(result?: "correct" | "present" | "absent") {
  if (result === "correct") {
    return "border-teal-600 bg-teal-100 text-teal-950";
  }
  if (result === "present") {
    return "border-amber-500 bg-amber-100 text-amber-950";
  }
  if (result === "absent") {
    return "border-slate-400 bg-slate-200 text-slate-700";
  }
  return "border-slate-300 bg-white text-slate-900";
}

function KeyboardGroup({
  title,
  phonemes,
  onChoose,
}: {
  title: string;
  phonemes: PhonemeToken[];
  onChoose: (symbol: string) => void;
}) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wide text-slate-600">
        {title}
      </h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {phonemes.map((phoneme) => (
          <button
            key={phoneme.symbol}
            type="button"
            onClick={() => onChoose(phoneme.symbol)}
            title={`/${phoneme.symbol}/ = ${phoneme.label} as in ${phoneme.example}`}
            className="min-h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 transition hover:border-teal-500 hover:bg-teal-50 focus:outline-none focus:ring-4 focus:ring-amber-300"
          >
            {phoneme.symbol}
          </button>
        ))}
      </div>
    </div>
  );
}

export function WordlePreview({
  target = wordleActivity.target,
  title = wordleActivity.title,
  maxGuesses = wordleActivity.maxGuesses,
}: {
  target?: CorpusWord;
  title?: string;
  maxGuesses?: number;
}) {
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState<SubmittedGuess[]>([]);
  const [message, setMessage] = useState("Choose phonemes from the HCE keyboard.");
  const isSolved = submitted.some((guess) =>
    guess.result.every((result) => result === "correct"),
  );

  const groupedKeyboard = useMemo(
    () => ({
      consonants: phonemeKeyboard.filter((phoneme) => phoneme.group === "Consonants"),
      vowels: phonemeKeyboard.filter(
        (phoneme) => phoneme.group === "Vowels and Diphthongs",
      ),
    }),
    [],
  );

  function choosePhoneme(symbol: string) {
    if (
      isSolved ||
      submitted.length >= maxGuesses ||
      currentGuess.length >= target.phonemes.length
    ) {
      return;
    }
    setCurrentGuess((guess) => [...guess, symbol]);
  }

  function deletePhoneme() {
    setCurrentGuess((guess) => guess.slice(0, -1));
  }

  function submitGuess() {
    if (submitted.length >= maxGuesses || isSolved) {
      setMessage("This Wordle preview is finished. Choose another target to reset.");
      return;
    }

    if (currentGuess.length !== target.phonemes.length) {
      setMessage(`Choose ${target.phonemes.length} phonemes before checking.`);
      return;
    }

    const result = scoreGuess(currentGuess, target.phonemes);
    const solved = result.every((item) => item === "correct");
    setSubmitted((guesses) => [...guesses, { phonemes: currentGuess, result }]);
    setCurrentGuess([]);
    setMessage(
      solved
        ? `Correct. The English equivalence is "${target.english}".`
        : "Not quite. Green is correct position; amber appears elsewhere.",
    );
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-teal-700">
            {target.difficulty}
          </p>
          <h2 className="text-2xl font-bold text-slate-950">
            {title}
          </h2>
        </div>
        <span className="w-fit rounded-md bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">
          One corpus target
        </span>
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold text-slate-700">Target pattern</p>
        <div className="mt-2 flex flex-wrap gap-3" aria-label="Target phoneme hints">
          {target.phonemes.map((symbol) => {
            const phoneme = findPhoneme(symbol);
            return phoneme ? (
              <PhonemeChip key={symbol} phoneme={phoneme} />
            ) : (
              <span key={symbol}>/{symbol}/</span>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-2" aria-label="Submitted phoneme guesses">
        {Array.from({ length: maxGuesses }).map((_, rowIndex) => {
          const row = submitted[rowIndex];
          const active = rowIndex === submitted.length && !isSolved;
          const cells = row?.phonemes ?? (active ? currentGuess : []);

          return (
            <div
              key={rowIndex}
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${target.phonemes.length}, minmax(48px, 1fr))` }}
            >
              {Array.from({ length: target.phonemes.length }).map((_, cellIndex) => (
                <span
                  key={cellIndex}
                  className={`grid min-h-14 place-items-center rounded-md border text-lg font-extrabold ${cellClass(row?.result[cellIndex])}`}
                >
                  {cells[cellIndex] ? `/${cells[cellIndex]}/` : ""}
                </span>
              ))}
            </div>
          );
        })}
      </div>

      <p role="status" className="mt-4 rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
        {message}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={submitGuess}
          className="rounded-md bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-amber-300"
        >
          Check phonemes
        </button>
        <button
          type="button"
          onClick={deletePhoneme}
          className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-amber-300"
        >
          Delete
        </button>
      </div>

      <div className="mt-6 grid gap-5">
        <KeyboardGroup
          title="Consonants"
          phonemes={groupedKeyboard.consonants}
          onChoose={choosePhoneme}
        />
        <KeyboardGroup
          title="Vowels and diphthongs"
          phonemes={groupedKeyboard.vowels}
          onChoose={choosePhoneme}
        />
      </div>
    </section>
  );
}
