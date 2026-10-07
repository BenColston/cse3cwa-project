import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const api = "http://localhost:4080";
const words = [
  { word: "thin", phonemes: ["θ", "ɪ", "n"], hint: "TH as in thin" },
  { word: "ship", phonemes: ["ʃ", "ɪ", "p"] },
  { word: "tin", phonemes: ["t", "ɪ", "n"] },
  { word: "jam", phonemes: ["dʒ", "æ", "m"] },
  { word: "sing", phonemes: ["s", "ɪ", "ŋ"] },
];

for (const type of ["WORDLE", "WORD_SEARCH"] as const) {
  test(`${type} stored configuration generates a persisted playable download`, async ({ page, request }, testInfo) => {
    const name = `Final review ${type} ${Date.now()}`;
    const createdList = await request.post(`${api}/word-lists`, {
      data: { name, source: "Playwright integrated review", words },
    });
    expect(createdList.status()).toBe(201);
    const list = (await createdList.json()).wordList;
    try {
      const createdConfig = await request.post(`${api}/activities`, { data: {
        name, type, difficulty: type === "WORDLE" ? "EASY" : "CUSTOM", wordListId: list.id,
        settings: type === "WORDLE"
          ? { targetEnglish: "jam", targetPhonemes: words[3].phonemes, maxGuesses: 6 }
          : { rows: 8, cols: 8, wordCount: 5 },
      } });
      expect(createdConfig.status()).toBe(201);
      const config = (await createdConfig.json()).activity;
      await page.goto(type === "WORDLE" ? "/wordle" : "/word-search");
      const selector = page.getByRole("combobox", { name: /Load saved configuration/ });
      await expect(selector.locator(`option[value="${config.id}"]`)).toHaveCount(1);
      await selector.selectOption(config.id);
      await expect(page.getByText(`Loaded configuration: ${name}.`, { exact: true })).toBeVisible();

      const storedResponse = page.waitForResponse((response) =>
        response.url() === `${api}/activities/${config.id}/outputs` && response.request().method() === "POST");
      await page.getByRole("button", { name: "Store generated HTML", exact: true }).click();
      expect((await storedResponse).status()).toBe(201);
      const outputs = await request.get(`${api}/activities/${config.id}/outputs`);
      expect(outputs.status()).toBe(200);
      const data = await outputs.json();
      expect(data.outputs).toHaveLength(1);

      await page.goto("/saved-data");
      const card = page.getByRole("article").filter({ has: page.getByRole("heading", { name, exact: true }) })
        .filter({ has: page.getByRole("button", { name: "Download", exact: true }) });
      const pending = page.waitForEvent("download");
      await card.getByRole("button", { name: "Download", exact: true }).click();
      const download = await pending;
      const path = testInfo.outputPath(download.suggestedFilename());
      await download.saveAs(path);
      expect(await readFile(path, "utf8")).toBe(data.outputs[0].html);
      await page.goto(pathToFileURL(path).href);

      if (type === "WORDLE") {
        const hints = page.locator('[aria-label="Target phoneme hints"] .chip');
        await expect(hints).toHaveText(words[3].phonemes.map((symbol) => `/${symbol}/`));
        for (const symbol of words[3].phonemes) {
          await page.getByRole("button", { name: symbol, exact: true }).click();
        }
        await page.getByRole("button", { name: "Check phonemes", exact: true }).click();
        await expect(page.getByRole("status")).toContainText("Correct.");
      } else {
        const grid = page.getByRole("grid", { name: /phoneme word search grid/i });
        await expect(grid.locator("button")).toHaveCount(64);
        const path = await grid.evaluate((element, target) => {
          const cells = Array.from(element.querySelectorAll<HTMLButtonElement>("button[data-row][data-col]"));
          const values = new Map(cells.map((cell) => [`${cell.dataset.row}-${cell.dataset.col}`, cell.textContent?.trim()]));
          for (const cell of cells) {
            for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]]) {
              const coords = target.map((_, index) => ({ row: Number(cell.dataset.row) + dr * index, col: Number(cell.dataset.col) + dc * index }));
              if (coords.every((coord, index) => values.get(`${coord.row}-${coord.col}`) === target[index])) return coords;
            }
          }
          return null;
        }, words[3].phonemes);
        expect(path).not.toBeNull();
        const start = path![0];
        const end = path!.at(-1)!;
        await grid.locator(`button[data-row="${start.row}"][data-col="${start.col}"]`).focus();
        await page.keyboard.press("Enter");
        for (let row = start.row; row !== end.row; row += Math.sign(end.row - start.row)) await page.keyboard.press(end.row > start.row ? "ArrowDown" : "ArrowUp");
        for (let col = start.col; col !== end.col; col += Math.sign(end.col - start.col)) await page.keyboard.press(end.col > start.col ? "ArrowRight" : "ArrowLeft");
        await page.keyboard.press("Enter");
        await expect(page.getByRole("status").filter({ hasText: "Found" })).toContainText("dʒ/ /æ/ /m");
        for (const coord of path!) {
          await expect(grid.locator(`button[data-row="${coord.row}"][data-col="${coord.col}"]`)).toHaveAttribute("aria-label", /, found$/);
        }
      }
      await page.screenshot({ path: testInfo.outputPath("stored-activity.png"), fullPage: true });
    } finally {
      expect((await request.delete(`${api}/word-lists/${list.id}`)).status()).toBe(204);
    }
  });
}
