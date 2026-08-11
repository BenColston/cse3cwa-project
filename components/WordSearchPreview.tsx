"use client";

import { PointerEvent, useMemo, useRef, useState } from "react";
import { wordSearchWords } from "@/lib/activityData";
import { createWordSearchPuzzle } from "@/lib/wordSearch";

type Coord = {
  row: number;
  col: number;
};

type FoundSelection = {
  english: string;
  phonemes: string[];
  coords: Coord[];
};

function coordKey(row: number, col: number) {
  return `${row}-${col}`;
}

function getPath(start: Coord, end: Coord): Coord[] {
  const rowDelta = end.row - start.row;
  const colDelta = end.col - start.col;
  const isStraight =
    rowDelta === 0 ||
    colDelta === 0 ||
    Math.abs(rowDelta) === Math.abs(colDelta);

  if (!isStraight) {
    return [];
  }

  const steps = Math.max(Math.abs(rowDelta), Math.abs(colDelta));
  const rowStep = rowDelta === 0 ? 0 : rowDelta / steps;
  const colStep = colDelta === 0 ? 0 : colDelta / steps;

  return Array.from({ length: steps + 1 }, (_, index) => ({
    row: start.row + rowStep * index,
    col: start.col + colStep * index,
  }));
}

function pathValue(grid: string[][], path: Coord[]) {
  return path.map((coord) => grid[coord.row]?.[coord.col]).join("|");
}

export function WordSearchPreview() {
  const [rows, setRows] = useState(8);
  const [cols, setCols] = useState(8);
  const [version, setVersion] = useState(0);
  const [showAnswers, setShowAnswers] = useState(false);
  const [selectionStart, setSelectionStart] = useState<Coord | null>(null);
  const [selectedPath, setSelectedPath] = useState<Coord[]>([]);
  const [foundSelections, setFoundSelections] = useState<FoundSelection[]>([]);
  const [message, setMessage] = useState("Drag across the grid to find a phoneme sequence.");
  const selectionStartRef = useRef<Coord | null>(null);
  const selectedPathRef = useRef<Coord[]>([]);

  const puzzle = useMemo(
    () => createWordSearchPuzzle(wordSearchWords, rows, cols, version),
    [rows, cols, version],
  );
  const answerCells = new Set(
    puzzle.solutions.flatMap((solution) =>
      solution.coords.map((coord) => coordKey(coord.row, coord.col)),
    ),
  );
  const selectedCells = new Set(
    selectedPath.map((coord) => coordKey(coord.row, coord.col)),
  );
  const foundCells = new Set(
    foundSelections.flatMap((selection) =>
      selection.coords.map((coord) => coordKey(coord.row, coord.col)),
    ),
  );

  function updateRows(value: string) {
    setRows(Math.max(6, Math.min(12, Number(value) || 8)));
    setFoundSelections([]);
    setSelectedPath([]);
    selectedPathRef.current = [];
  }

  function updateCols(value: string) {
    setCols(Math.max(6, Math.min(12, Number(value) || 8)));
    setFoundSelections([]);
    setSelectedPath([]);
    selectedPathRef.current = [];
  }

  function regeneratePuzzle() {
    setVersion((value) => value + 1);
    setShowAnswers(false);
    setFoundSelections([]);
    setSelectedPath([]);
    selectedPathRef.current = [];
    setMessage("New puzzle generated. Drag across the grid to find a word.");
  }

  function startSelection(coord: Coord) {
    selectionStartRef.current = coord;
    selectedPathRef.current = [coord];
    setSelectionStart(coord);
    setSelectedPath([coord]);
  }

  function extendSelection(coord: Coord) {
    const start = selectionStartRef.current ?? selectionStart;
    if (!start) {
      return;
    }

    const path = getPath(start, coord);
    if (path.length > 0) {
      selectedPathRef.current = path;
      setSelectedPath(path);
    }
  }

  function finishSelection(event?: PointerEvent<HTMLDivElement>) {
    const targetCell = event?.target instanceof HTMLElement
      ? event.target.closest("[data-row][data-col]")
      : null;
    const start = selectionStartRef.current ?? selectionStart;
    const finalPath =
      start && targetCell instanceof HTMLElement
        ? getPath(start, {
            row: Number(targetCell.dataset.row),
            col: Number(targetCell.dataset.col),
          })
        : selectedPathRef.current;

    if (finalPath.length === 0) {
      selectionStartRef.current = null;
      selectedPathRef.current = [];
      setSelectionStart(null);
      setSelectedPath([]);
      return;
    }

    const selected = pathValue(puzzle.grid, finalPath);
    const reversed = pathValue(puzzle.grid, [...finalPath].reverse());
    const match = puzzle.solutions.find((solution) => {
      const answer = solution.phonemes.join("|");
      return answer === selected || answer === reversed;
    });

    if (match) {
      setFoundSelections((selections) => [
        ...selections,
        {
          english: match.english,
          phonemes: match.phonemes,
          coords: finalPath,
        },
      ]);
      setMessage(`Found ${match.english}: /${match.phonemes.join("/ /")}/`);
    } else {
      setMessage("No match yet. Try a straight horizontal, vertical, or diagonal path.");
    }

    selectionStartRef.current = null;
    selectedPathRef.current = [];
    setSelectionStart(null);
    setSelectedPath([]);
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
          onClick={regeneratePuzzle}
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
          className="grid touch-none gap-1"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(34px, 1fr))` }}
          aria-label="Generated phoneme word search grid"
          onPointerLeave={() => {
            selectionStartRef.current = null;
            selectedPathRef.current = [];
            setSelectionStart(null);
            setSelectedPath([]);
          }}
          onPointerUp={finishSelection}
          onPointerCancel={() => {
            selectionStartRef.current = null;
            selectedPathRef.current = [];
            setSelectionStart(null);
            setSelectedPath([]);
          }}
        >
          {puzzle.grid.map((row, rowIndex) =>
            row.map((phoneme, colIndex) => {
              const key = coordKey(rowIndex, colIndex);
              const isAnswer = showAnswers && answerCells.has(key);
              const isSelected = selectedCells.has(key);
              const isFound = foundCells.has(key);
              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  type="button"
                  data-row={rowIndex}
                  data-col={colIndex}
                  onPointerDown={() => startSelection({ row: rowIndex, col: colIndex })}
                  onPointerEnter={() => extendSelection({ row: rowIndex, col: colIndex })}
                  onFocus={() => setMessage("Use pointer drag to select phoneme words in the grid.")}
                  className={`grid aspect-square place-items-center rounded border text-xs font-extrabold sm:text-sm ${
                    isFound
                      ? "border-emerald-500 bg-emerald-100 text-emerald-950"
                      : isSelected
                        ? "border-amber-500 bg-amber-100 text-amber-950"
                        : isAnswer
                      ? "border-teal-500 bg-teal-100 text-teal-950"
                      : "border-slate-300 bg-white text-slate-900"
                  }`}
                >
                  {phoneme}
                </button>
              );
            }),
          )}
        </div>
        <div>
          <p
            role="status"
            className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700"
          >
            {message}
          </p>
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">
            Word list
          </h3>
          <ul className="mt-3 grid gap-2">
            {wordSearchWords.map((word) => (
              <li
                key={word.english}
                className={`rounded-md border px-3 py-2 text-sm ${
                  foundSelections.some((selection) => selection.english === word.english)
                    ? "border-emerald-300 bg-emerald-50 text-emerald-900 line-through"
                    : "border-slate-200 bg-slate-50 text-slate-700"
                }`}
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
