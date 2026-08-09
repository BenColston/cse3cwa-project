import {
  findPhoneme,
  phonemeKeyboard,
  wordleActivity,
  wordSearchWords,
  type CorpusWord,
} from "@/lib/activityData";
import { createWordSearchPuzzle } from "@/lib/wordSearch";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function documentShell(title: string, body: string, script = "") {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Arial, Helvetica, sans-serif; background: #f8fafc; color: #0f172a; }
    main { max-width: 980px; margin: 0 auto; padding: 28px 16px; }
    .panel { background: white; border: 1px solid #dbe4ee; border-radius: 8px; padding: 20px; box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08); }
    h1 { margin: 0 0 10px; font-size: clamp(1.7rem, 4vw, 2.3rem); }
    h2 { margin: 22px 0 10px; font-size: 1rem; text-transform: uppercase; letter-spacing: .04em; color: #475569; }
    p { line-height: 1.6; }
    button { border: 0; border-radius: 6px; background: #0f766e; color: white; font-weight: 700; padding: 10px 14px; cursor: pointer; }
    button.secondary { border: 1px solid #cbd5e1; background: white; color: #1e293b; }
    button:focus-visible, input:focus-visible, textarea:focus-visible { outline: 3px solid #f59e0b; outline-offset: 2px; }
    input, textarea { border: 1px solid #94a3b8; border-radius: 6px; padding: 10px; font: inherit; }
    textarea { width: 100%; min-height: 130px; }
    .muted { color: #475569; }
    .row, .actions, .keyboard { display: flex; flex-wrap: wrap; gap: 10px; }
    .chip, .key { border: 1px solid #99f6e4; background: #ccfbf1; color: #134e4a; border-radius: 6px; padding: 8px 10px; font-weight: 700; }
    .key { min-width: 44px; background: white; border-color: #cbd5e1; color: #0f172a; }
    .wordle-row { display: grid; gap: 8px; margin-bottom: 8px; }
    .cell { aspect-ratio: 1; min-height: 42px; display: grid; place-items: center; border: 1px solid #cbd5e1; background: #fff; border-radius: 4px; font-weight: 800; }
    .correct { background: #ccfbf1; border-color: #0f766e; color: #134e4a; }
    .present { background: #fef3c7; border-color: #f59e0b; color: #78350f; }
    .absent { background: #e2e8f0; border-color: #94a3b8; color: #334155; }
    .grid { display: grid; gap: 4px; max-width: 520px; }
    .grid.word-search { touch-action: none; }
    .selected { background: #fef3c7; border-color: #f59e0b; color: #78350f; }
    .found { background: #d1fae5; border-color: #10b981; color: #064e3b; }
    .answer { background: #ccfbf1; border-color: #0f766e; color: #134e4a; }
    .layout { display: grid; gap: 20px; }
    @media (min-width: 760px) { .layout { grid-template-columns: minmax(320px, 1fr) 1fr; } }
  </style>
</head>
<body>
  <main>${body}</main>
  ${script}
</body>
</html>`;
}

export function generateWordleHtml(activity = wordleActivity) {
  const { target } = activity;
  const targetHints = target.phonemes
    .map((symbol) => {
      const phoneme = findPhoneme(symbol);
      const title = phoneme
        ? `/${symbol}/ = ${phoneme.label} as in ${phoneme.example}`
        : `/${symbol}/`;
      return `<span class="chip" title="${escapeHtml(title)}">/${escapeHtml(symbol)}/</span>`;
    })
    .join("");
  const keyboard = phonemeKeyboard
    .map((phoneme) => {
      const title = `/${phoneme.symbol}/ = ${phoneme.label} as in ${phoneme.example}`;
      return `<button class="key" type="button" data-symbol="${escapeHtml(phoneme.symbol)}" title="${escapeHtml(title)}">${escapeHtml(phoneme.symbol)}</button>`;
    })
    .join("");
  const rows = Array.from({ length: activity.maxGuesses })
    .map(
      (_, rowIndex) =>
        `<div class="wordle-row" data-row="${rowIndex}" style="grid-template-columns: repeat(${target.phonemes.length}, minmax(48px, 1fr));">${Array.from(
          { length: target.phonemes.length },
        )
          .map((__, cellIndex) => `<span class="cell" data-cell="${cellIndex}"></span>`)
          .join("")}</div>`,
    )
    .join("");

  return documentShell(
    activity.title,
    `<section class="panel">
      <p class="muted">HCE phoneme Wordle classroom activity</p>
      <h1>${escapeHtml(activity.title)}</h1>
      <p>Choose phonemes from the keyboard to match the target sequence. Hover over hint chips or keyboard buttons for phoneme-to-English equivalence.</p>
      <div class="row" aria-label="Target phoneme hints">${targetHints}</div>
      <h2>Guesses</h2>
      <div id="board">${rows}</div>
      <p id="feedback" role="status" class="muted">Choose ${target.phonemes.length} phonemes, then check your answer.</p>
      <div class="actions">
        <button type="button" id="checkBtn">Check phonemes</button>
        <button type="button" class="secondary" id="deleteBtn">Delete</button>
      </div>
      <h2>HCE phoneme keyboard</h2>
      <div class="keyboard">${keyboard}</div>
    </section>`,
    `<script>
      const target = ${JSON.stringify(target)};
      const maxGuesses = ${activity.maxGuesses};
      let current = [];
      let row = 0;
      const feedback = document.getElementById('feedback');

      function cellsForRow(index) {
        return Array.from(document.querySelectorAll('[data-row="' + index + '"] .cell'));
      }

      function renderCurrent() {
        const cells = cellsForRow(row);
        cells.forEach((cell, index) => {
          cell.textContent = current[index] ? '/' + current[index] + '/' : '';
        });
      }

      function scoreGuess(guess) {
        return guess.map((phoneme, index) => {
          if (phoneme === target.phonemes[index]) return 'correct';
          return target.phonemes.includes(phoneme) ? 'present' : 'absent';
        });
      }

      document.querySelectorAll('[data-symbol]').forEach((button) => {
        button.addEventListener('click', () => {
          if (row >= maxGuesses || current.length >= target.phonemes.length) return;
          current.push(button.dataset.symbol);
          renderCurrent();
        });
      });

      document.getElementById('deleteBtn').addEventListener('click', () => {
        current.pop();
        renderCurrent();
      });

      document.getElementById('checkBtn').addEventListener('click', () => {
        if (current.length !== target.phonemes.length) {
          feedback.textContent = 'Choose ' + target.phonemes.length + ' phonemes before checking.';
          return;
        }
        const result = scoreGuess(current);
        const cells = cellsForRow(row);
        result.forEach((item, index) => cells[index].classList.add(item));
        if (result.every((item) => item === 'correct')) {
          feedback.textContent = 'Correct. The English equivalence is "' + target.english + '".';
          row = maxGuesses;
          return;
        }
        row += 1;
        current = [];
        feedback.textContent = row >= maxGuesses ? 'Answer: ' + target.english : 'Try another phoneme sequence.';
      });
    </script>`,
  );
}

export function generateWordSearchHtml(words: CorpusWord[] = wordSearchWords) {
  const wordLines = words.map((word) => word.phonemes.join(" ")).join("\n");
  const initialPuzzle = createWordSearchPuzzle(words, 8, 8);

  return documentShell(
    "Phoneme Word Search",
    `<section class="panel">
      <p class="muted">Generated HCE phoneme word search</p>
      <h1>Phoneme Word Search</h1>
      <p>Find the phoneme sequences in the grid. Each cell contains one phoneme unit, including multi-character phonemes such as /tʃ/ or /æɪ/.</p>
      <div class="layout">
        <div>
          <label><strong>Words as space-separated phonemes</strong></label>
          <textarea id="wordInput">${escapeHtml(wordLines)}</textarea>
          <div class="actions">
            <label>Rows <input id="rows" type="number" min="6" max="12" value="8"></label>
            <label>Columns <input id="cols" type="number" min="6" max="12" value="8"></label>
          </div>
          <div class="actions" style="margin-top: 12px;">
            <button type="button" id="generateBtn">Generate puzzle</button>
            <button type="button" class="secondary" id="answersBtn">Show answers</button>
          </div>
          <h2>Word list</h2>
          <div id="wordList"></div>
        </div>
        <div>
          <div id="grid" class="grid word-search" aria-label="Phoneme word search grid"></div>
          <p id="selectionFeedback" role="status" class="muted">Drag across the grid to find a phoneme sequence.</p>
        </div>
      </div>
    </section>`,
    `<script>
      let seed = 0;
      let showAnswers = false;
      let puzzle = ${JSON.stringify(initialPuzzle)};
      let selecting = false;
      let selectionStart = null;
      let selectedPath = [];
      const foundWords = new Set();
      const fallbackPool = ${JSON.stringify(phonemeKeyboard.map((phoneme) => phoneme.symbol))};
      const directions = [
        { row: 0, col: 1 },
        { row: 1, col: 0 },
        { row: 1, col: 1 },
        { row: -1, col: 1 }
      ];

      function parseWords() {
        return document.getElementById('wordInput').value
          .split('\\n')
          .map((line, index) => ({
            english: 'word ' + (index + 1),
            phonemes: line.trim().split(/\\s+/).filter(Boolean)
          }))
          .filter((word) => word.phonemes.length > 0);
      }

      function canPlace(grid, phonemes, row, col, direction) {
        const endRow = row + direction.row * (phonemes.length - 1);
        const endCol = col + direction.col * (phonemes.length - 1);
        if (endRow < 0 || endRow >= grid.length || endCol < 0 || endCol >= grid[0].length) return false;
        return phonemes.every((phoneme, index) => {
          const nextRow = row + direction.row * index;
          const nextCol = col + direction.col * index;
          return grid[nextRow][nextCol] === null || grid[nextRow][nextCol] === phoneme;
        });
      }

      function coordKey(row, col) {
        return row + '-' + col;
      }

      function getPath(start, end) {
        const rowDelta = end.row - start.row;
        const colDelta = end.col - start.col;
        const isStraight = rowDelta === 0 || colDelta === 0 || Math.abs(rowDelta) === Math.abs(colDelta);
        if (!isStraight) return [];
        const steps = Math.max(Math.abs(rowDelta), Math.abs(colDelta));
        const rowStep = rowDelta === 0 ? 0 : rowDelta / steps;
        const colStep = colDelta === 0 ? 0 : colDelta / steps;
        return Array.from({ length: steps + 1 }, (_, index) => ({
          row: start.row + rowStep * index,
          col: start.col + colStep * index
        }));
      }

      function pathValue(path) {
        return path.map((coord) => puzzle.grid[coord.row] && puzzle.grid[coord.row][coord.col]).join('|');
      }

      function clearSelection() {
        selecting = false;
        selectionStart = null;
        selectedPath = [];
        renderPuzzle();
      }

      function finishSelection() {
        if (selectedPath.length === 0) {
          clearSelection();
          return;
        }

        const selected = pathValue(selectedPath);
        const reversed = pathValue([...selectedPath].reverse());
        const match = puzzle.solutions.find((solution) => {
          const answer = solution.phonemes.join('|');
          return answer === selected || answer === reversed;
        });

        if (match) {
          foundWords.add(match.english);
          document.getElementById('selectionFeedback').textContent = 'Found: /' + match.phonemes.join('/ /') + '/';
        } else {
          document.getElementById('selectionFeedback').textContent = 'No match yet. Try a straight horizontal, vertical, or diagonal path.';
        }

        selecting = false;
        selectionStart = null;
        selectedPath = [];
        renderPuzzle();
      }

      function buildPuzzle() {
        const words = parseWords();
        const rows = Math.max(6, Math.min(12, Number(document.getElementById('rows').value) || 8));
        const cols = Math.max(6, Math.min(12, Number(document.getElementById('cols').value) || 8));
        const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => null));
        const solutions = [];

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

        const pool = words.flatMap((word) => word.phonemes);
        let filler = 0;
        puzzle = {
          grid: grid.map((row) => row.map((cell) => {
            if (cell) return cell;
            filler += 1;
            return (pool.length ? pool : fallbackPool)[filler % (pool.length ? pool.length : fallbackPool.length)];
          })),
          solutions
        };
        foundWords.clear();
        renderPuzzle(words);
      }

      function renderPuzzle(words = parseWords()) {
        const grid = document.getElementById('grid');
        grid.innerHTML = '';
        grid.style.gridTemplateColumns = 'repeat(' + puzzle.grid[0].length + ', minmax(36px, 1fr))';
        const answerCells = new Set(puzzle.solutions.flatMap((solution) => solution.coords.map((coord) => coord.row + '-' + coord.col)));
        const selectedCells = new Set(selectedPath.map((coord) => coordKey(coord.row, coord.col)));
        const foundCells = new Set(puzzle.solutions
          .filter((solution) => foundWords.has(solution.english))
          .flatMap((solution) => solution.coords.map((coord) => coordKey(coord.row, coord.col))));
        puzzle.grid.forEach((row, rowIndex) => {
          row.forEach((phoneme, colIndex) => {
            const key = coordKey(rowIndex, colIndex);
            const cell = document.createElement('button');
            cell.type = 'button';
            cell.dataset.row = String(rowIndex);
            cell.dataset.col = String(colIndex);
            cell.className = 'cell'
              + (foundCells.has(key) ? ' found' : '')
              + (selectedCells.has(key) ? ' selected' : '')
              + (showAnswers && answerCells.has(key) ? ' answer' : '');
            cell.textContent = phoneme;
            grid.appendChild(cell);
          });
        });
        document.getElementById('wordList').innerHTML = words
          .map((word) => '<p class="' + (foundWords.has(word.english) ? 'found' : '') + '"><strong>/' + word.phonemes.join('/ /') + '/</strong></p>')
          .join('');
      }

      document.getElementById('grid').addEventListener('pointerdown', (event) => {
        const cell = event.target.closest('[data-row]');
        if (!cell) return;
        selecting = true;
        selectionStart = { row: Number(cell.dataset.row), col: Number(cell.dataset.col) };
        selectedPath = [selectionStart];
        renderPuzzle();
      });

      document.getElementById('grid').addEventListener('pointerover', (event) => {
        if (!selecting || !selectionStart) return;
        const cell = event.target.closest('[data-row]');
        if (!cell) return;
        const path = getPath(selectionStart, { row: Number(cell.dataset.row), col: Number(cell.dataset.col) });
        if (path.length > 0) {
          selectedPath = path;
          renderPuzzle();
        }
      });

      document.getElementById('grid').addEventListener('pointerup', finishSelection);
      document.getElementById('grid').addEventListener('pointerleave', clearSelection);
      document.getElementById('grid').addEventListener('pointercancel', clearSelection);

      document.getElementById('generateBtn').addEventListener('click', () => {
        seed += 1;
        showAnswers = false;
        selectedPath = [];
        document.getElementById('answersBtn').textContent = 'Show answers';
        buildPuzzle();
      });
      document.getElementById('answersBtn').addEventListener('click', () => {
        showAnswers = !showAnswers;
        document.getElementById('answersBtn').textContent = showAnswers ? 'Hide answers' : 'Show answers';
        renderPuzzle();
      });
      buildPuzzle();
    </script>`,
  );
}

export function downloadHtml(filename: string, html: string) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
