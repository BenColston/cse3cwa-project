import { phonemeKeyboard, type CorpusWord } from "@/lib/activityData";

export type WordSearchSolution = {
  english: string;
  phonemes: string[];
  coords: { row: number; col: number }[];
};

export type WordSearchPuzzle = {
  grid: string[][];
  solutions: WordSearchSolution[];
};

const directions = [
  { row: 0, col: 1 },
  { row: 1, col: 0 },
  { row: 1, col: 1 },
  { row: -1, col: 1 },
];

function tokenSeed(words: CorpusWord[]) {
  return words.flatMap((word) => word.phonemes);
}

function fillerToken(index: number, pool: string[]) {
  return pool[index % pool.length] ?? phonemeKeyboard[index % phonemeKeyboard.length].symbol;
}

function canPlace(
  grid: (string | null)[][],
  phonemes: string[],
  row: number,
  col: number,
  direction: { row: number; col: number },
) {
  const endRow = row + direction.row * (phonemes.length - 1);
  const endCol = col + direction.col * (phonemes.length - 1);

  if (endRow < 0 || endRow >= grid.length || endCol < 0 || endCol >= grid[0].length) {
    return false;
  }

  return phonemes.every((phoneme, index) => {
    const nextRow = row + direction.row * index;
    const nextCol = col + direction.col * index;
    return grid[nextRow][nextCol] === null || grid[nextRow][nextCol] === phoneme;
  });
}

export function createWordSearchPuzzle(
  words: CorpusWord[],
  rows = 8,
  cols = 8,
  seed = 0,
): WordSearchPuzzle {
  const grid: (string | null)[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => null),
  );
  const solutions: WordSearchSolution[] = [];

  words.forEach((word, wordIndex) => {
    let placed = false;

    for (let attempt = 0; attempt < rows * cols * directions.length && !placed; attempt += 1) {
      const direction = directions[(attempt + wordIndex + seed) % directions.length];
      const row = (attempt * 2 + wordIndex + seed) % rows;
      const col = (attempt * 3 + wordIndex + seed * 2) % cols;

      if (canPlace(grid, word.phonemes, row, col, direction)) {
        const coords = word.phonemes.map((phoneme, index) => {
          const nextRow = row + direction.row * index;
          const nextCol = col + direction.col * index;
          grid[nextRow][nextCol] = phoneme;
          return { row: nextRow, col: nextCol };
        });
        solutions.push({ english: word.english, phonemes: word.phonemes, coords });
        placed = true;
      }
    }
  });

  const pool = tokenSeed(words);
  let fillerIndex = 0;
  const completeGrid = grid.map((row) =>
    row.map((cell) => {
      if (cell) {
        return cell;
      }
      fillerIndex += 1;
      return fillerToken(fillerIndex, pool);
    }),
  );

  return { grid: completeGrid, solutions };
}
