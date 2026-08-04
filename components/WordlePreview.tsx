"use client";

import { useState } from "react";
import { PhonemeChip } from "@/components/PhonemeChip";
import { wordleActivity } from "@/lib/activityData";

export function WordlePreview() {
  const [guess, setGuess] = useState("");
  const isCorrect = guess.trim().toLowerCase() === wordleActivity.englishAnswer;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-teal-700">
            {wordleActivity.difficulty}
          </p>
          <h2 className="text-2xl font-bold text-slate-950">
            {wordleActivity.title}
          </h2>
        </div>
        <span className="w-fit rounded-md bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">
          One target word
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-3" aria-label="Target phonemes">
        {wordleActivity.phonemes.map((phoneme) => (
          <PhonemeChip key={phoneme.symbol} phoneme={phoneme} />
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          Teacher preview answer
          <input
            value={guess}
            onChange={(event) => setGuess(event.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-base font-normal text-slate-950 focus:outline-none focus:ring-4 focus:ring-amber-300"
            placeholder="Type the English word"
          />
        </label>
        <div className="flex items-end">
          <p
            role="status"
            className={`min-h-11 rounded-md px-3 py-2 text-sm font-semibold ${
              isCorrect
                ? "bg-teal-50 text-teal-900"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {isCorrect
              ? `Correct: ${wordleActivity.englishAnswer}`
              : "Use hover hints to connect sound and spelling."}
          </p>
        </div>
      </div>
    </section>
  );
}
