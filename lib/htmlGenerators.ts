import {
  wordleActivity,
  wordSearchGrid,
  wordSearchWords,
  type WordleActivity,
  type WordSearchWord,
} from "@/lib/activityData";

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
    body { margin: 0; font-family: Arial, Helvetica, sans-serif; background: #f8fafc; color: #0f172a; }
    main { max-width: 860px; margin: 0 auto; padding: 32px 18px; }
    .panel { background: white; border: 1px solid #dbe4ee; border-radius: 8px; padding: 20px; box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08); }
    h1 { margin: 0 0 10px; font-size: 2rem; }
    p { line-height: 1.6; }
    button { border: 0; border-radius: 6px; background: #0f766e; color: white; font-weight: 700; padding: 10px 14px; cursor: pointer; }
    button:focus-visible, input:focus-visible { outline: 3px solid #f59e0b; outline-offset: 2px; }
    .chips, .row, .actions { display: flex; flex-wrap: wrap; gap: 10px; }
    .chip { border: 1px solid #99f6e4; background: #ccfbf1; color: #134e4a; border-radius: 6px; padding: 8px 10px; font-weight: 700; }
    .muted { color: #475569; }
    .grid { display: grid; grid-template-columns: repeat(8, minmax(32px, 1fr)); gap: 6px; max-width: 430px; }
    .cell { aspect-ratio: 1; display: grid; place-items: center; border: 1px solid #cbd5e1; background: #fff; border-radius: 4px; font-weight: 800; }
    .found { background: #ccfbf1; border-color: #14b8a6; }
    input { border: 1px solid #94a3b8; border-radius: 6px; padding: 10px; min-width: 180px; }
  </style>
</head>
<body>
  <main>${body}</main>
  ${script}
</body>
</html>`;
}

export function generateWordleHtml(activity: WordleActivity = wordleActivity) {
  const phonemeChips = activity.phonemes
    .map(
      (phoneme) =>
        `<span class="chip" title="${escapeHtml(phoneme.symbol)} = ${escapeHtml(
          phoneme.label,
        )} as in ${escapeHtml(phoneme.example)}">${escapeHtml(
          phoneme.symbol,
        )} ${escapeHtml(phoneme.label)}</span>`,
    )
    .join("");

  return documentShell(
    activity.title,
    `<section class="panel">
      <p class="muted">Phoneme Wordle classroom activity</p>
      <h1>${escapeHtml(activity.title)}</h1>
      <p>Difficulty: <strong>${escapeHtml(activity.difficulty)}</strong></p>
      <p>Build the English word that matches this phoneme sequence.</p>
      <div class="chips" aria-label="Target phonemes">${phonemeChips}</div>
      <p class="muted">Hover over each phoneme for a sound-to-letter hint.</p>
      <label for="guess"><strong>Your answer</strong></label>
      <div class="actions">
        <input id="guess" autocomplete="off" aria-describedby="feedback" />
        <button type="button" onclick="checkGuess()">Check answer</button>
      </div>
      <p id="feedback" role="status"></p>
    </section>`,
    `<script>
      function checkGuess() {
        const answer = ${JSON.stringify(activity.englishAnswer)};
        const guess = document.getElementById('guess').value.trim().toLowerCase();
        const feedback = document.getElementById('feedback');
        if (guess === answer) {
          feedback.textContent = 'Correct. The English equivalence is "' + answer + '".';
        } else {
          feedback.textContent = 'Try again. Use the phoneme hints above.';
        }
      }
    </script>`,
  );
}

export function generateWordSearchHtml(
  words: WordSearchWord[] = wordSearchWords,
  grid: string[][] = wordSearchGrid,
) {
  const cells = grid
    .flat()
    .map((cell) => `<span class="cell">${escapeHtml(cell)}</span>`)
    .join("");
  const wordItems = words
    .map(
      (word) =>
        `<li><strong>${escapeHtml(word.phonemes)}</strong> - ${escapeHtml(
          word.clue,
        )} <span class="muted">(${escapeHtml(word.english)})</span></li>`,
    )
    .join("");

  return documentShell(
    "Phoneme Word Search",
    `<section class="panel">
      <p class="muted">Phoneme recognition word search</p>
      <h1>Phoneme Word Search</h1>
      <p>Find the English letter patterns that match each phoneme clue.</p>
      <div class="grid" aria-label="Word search grid">${cells}</div>
      <h2>Phoneme clues</h2>
      <ul>${wordItems}</ul>
    </section>`,
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
