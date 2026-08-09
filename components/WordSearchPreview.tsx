"use client";

import { useMemo, useState } from "react";
import { wordSearchWords } from "@/lib/activityData";
import { createWordSearchPuzzle } from "@/lib/wordSearch";

function coordKey(row: number, col: number) {
  return `${row}-${col}`;
}

export function WordSearchPreview() {
  const [rows, setRows] = useState(8);
  const [cols, setCols] = useState(8);
  const [version, setVersion] = useState(0);
  const [showAnswers, setShowAnswers] = useState(false);

  const puzzle = useMemo(
    () => createWordSearchPuzzle(wordSearchWords, rows, cols, version),
    [rows, cols, version],
  );
  const answerCells = new Set(
    puzzle.solutions.flatMap((solution) =>
      solution.coords.map((coord) => coordKey(coord.row, coord.col)),
    ),
  );

  function updateRows(value: string) {
    setRows(Math.max(6, Math.min(12, Number(value) || 8)));
  }

  function updateCols(value: string) {
    setCols(Math.max(6, Math.min(12, Number(value) || 8)));
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-teal-700">
            Generated from corpus words
          </p>
          <h2 className="text-2xl font-bold text-slate-950">
            Phoneme Word Search
          </h2>
        </div>
        <span className="w-fit rounded-md bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">
          Five words
        </span>
      </div>

      <div className="mt-5 grid gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_1fr_auto_auto]">
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Rows
          <input
            type="number"
            min={6}
            max={12}
            value={rows}
            onChange={(event) => updateRows(event.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-950 focus:outline-none focus:ring-4 focus:ring-amber-300"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Columns
          <input
            type="number"
            min={6}
            max={12}
            value={cols}
            onChange={(event) => updateCols(event.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-950 focus:outline-none focus:ring-4 focus:ring-amber-300"
          />
        </label>
        <button
          type="button"
          onClick={() => setVersion((value) => value + 1)}
          className="self-end rounded-md bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-amber-300"
        >
          Generate
        </button>
        <button
          type="button"
          onClick={() => setShowAnswers((value) => !value)}
          className="self-end rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-amber-300"
        >
          {showAnswers ? "Hide answers" : "Show answers"}
        </button>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(280px,480px)_1fr]">
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(34px, 1fr))` }}
          aria-label="Generated phoneme word search grid"
        >
          {puzzle.grid.map((row, rowIndex) =>
            row.map((phoneme, colIndex) => {
              const isAnswer = showAnswers && answerCells.has(coordKey(rowIndex, colIndex));
              return (
                <span
                  key={`${rowIndex}-${colIndex}`}
                  className={`grid aspect-square place-items-center rounded border text-xs font-extrabold sm:text-sm ${
                    isAnswer
                      ? "border-teal-500 bg-teal-100 text-teal-950"
                      : "border-slate-300 bg-white text-slate-900"
                  }`}
                >
                  {phoneme}
                </span>
              );
            }),
          )}
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">
            Word list
          </h3>
          <ul className="mt-3 grid gap-2">
            {wordSearchWords.map((word) => (
              <li
                key={word.english}
                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              >
                <strong className="text-slate-950">
                  /{word.phonemes.join("/ /")}/
                </strong>
                <span> - {word.english}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
