import { expect, test, type Locator, type Page } from "@playwright/test";
import { pathToFileURL } from "node:url";
import { wordSearchWords } from "../lib/activityData";

type Coord = { row: number; col: number };
type Path = { coords: Coord[]; phonemes: string[] };

async function pathsIn(grid: Locator): Promise<Path[]> {
  return grid.evaluate((element, words) => {
    const cells = Array.from(element.querySelectorAll<HTMLButtonElement>("button[data-row][data-col]"));
    const values = new Map(cells.map((cell) => [`${cell.dataset.row}-${cell.dataset.col}`, cell.textContent?.trim()]));
    const directions = [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]];
    const paths: Path[] = [];
    for (const cell of cells) {
      for (const phonemes of words) {
        for (const [dr, dc] of directions) {
          const coords = phonemes.map((_, index) => ({ row: Number(cell.dataset.row) + dr * index, col: Number(cell.dataset.col) + dc * index }));
          if (coords.every((coord, index) => values.get(`${coord.row}-${coord.col}`) === phonemes[index])) paths.push({ coords, phonemes });
        }
      }
    }
    return paths;
  }, wordSearchWords.map((word) => word.phonemes));
}

function tile(grid: Locator, coord: Coord) {
  return grid.locator(`button[data-row="${coord.row}"][data-col="${coord.col}"]`);
}

async function foundCoords(grid: Locator) {
  return grid.locator('button[aria-label$=", found"]').evaluateAll((cells) => cells.map((cell) => `${cell.getAttribute("data-row")}-${cell.getAttribute("data-col")}`).sort());
}

async function moveTo(page: Page, from: Coord, to: Coord) {
  for (let row = from.row; row !== to.row; row += Math.sign(to.row - from.row)) await page.keyboard.press(to.row > from.row ? "ArrowDown" : "ArrowUp");
  for (let col = from.col; col !== to.col; col += Math.sign(to.col - from.col)) await page.keyboard.press(to.col > from.col ? "ArrowRight" : "ArrowLeft");
}

for (const mode of ["preview", "download"] as const) {
  test.describe(`Word Search ${mode}`, () => {
    test.beforeEach(async ({ page }, testInfo) => {
      await page.goto("/word-search");
      if (mode === "download") {
        const downloadPromise = page.waitForEvent("download");
        await page.getByRole("button", { name: "Generate HTML", exact: true }).click();
        const download = await downloadPromise;
        const path = testInfo.outputPath(download.suggestedFilename());
        await download.saveAs(path);
        await page.goto(pathToFileURL(path).href);
      }
    });

    test("keyboard finds horizontal, vertical, diagonal, and reversed paths", async ({ page }, testInfo) => {
      const grid = page.getByRole("grid", { name: /phoneme word search grid/i });
      const paths = await pathsIn(grid);
      const horizontal = paths.find(({ coords }) => coords[0].row === coords.at(-1)!.row)!;
      const vertical = paths.find(({ coords }) => coords[0].col === coords.at(-1)!.col)!;
      const diagonal = paths.find(({ coords }) => coords[0].row !== coords.at(-1)!.row && coords[0].col !== coords.at(-1)!.col)!;
      expect(horizontal).toBeTruthy();
      expect(vertical).toBeTruthy();
      expect(diagonal).toBeTruthy();
      const expected = new Set<string>();
      for (const [index, path] of [horizontal, vertical, diagonal, { ...horizontal, coords: [...horizontal.coords].reverse() }].entries()) {
        const start = path.coords[0];
        const end = path.coords.at(-1)!;
        await tile(grid, start).focus();
        await page.keyboard.press(index % 2 ? "Space" : "Enter");
        await moveTo(page, start, end);
        await expect(tile(grid, end)).toBeFocused();
        await page.keyboard.press(index % 2 ? "Enter" : "Space");
        await expect(page.getByRole("status").filter({ hasText: "Found" })).toContainText(path.phonemes.join("/ /"));
        path.coords.forEach((coord) => expected.add(`${coord.row}-${coord.col}`));
        expect(await foundCoords(grid)).toEqual([...expected].sort());
        await expect(tile(grid, end)).toBeFocused();
      }
      await page.screenshot({ path: testInfo.outputPath("desktop.png"), fullPage: true });
      await page.setViewportSize({ width: 390, height: 844 });
      await expect(grid).toBeVisible();
      await page.screenshot({ path: testInfo.outputPath("mobile.png"), fullPage: true });
      const layout = await page.evaluate(() => ({
        viewport: window.innerWidth,
        width: document.documentElement.scrollWidth,
        overflowing: Array.from(document.querySelectorAll("main *"))
          .filter((element) => element.getBoundingClientRect().right > window.innerWidth + 1)
          .slice(0, 8).map((element) => `${element.tagName}.${element.className}`),
      }));
      expect(layout.width, JSON.stringify(layout)).toBeLessThanOrEqual(layout.viewport);
    });

    test("navigation has one tab stop, cancels safely, and resets after regeneration", async ({ page }) => {
      const grid = page.getByRole("grid", { name: /phoneme word search grid/i });
      const first = tile(grid, { row: 0, col: 0 });
      await expect(grid.locator('button[tabindex="0"]')).toHaveCount(1);
      await page.getByRole("button", { name: "Show answers", exact: true }).focus();
      await page.keyboard.press("Tab");
      await expect(first).toBeFocused();
      await expect(first).toHaveAccessibleName(/Row 1, column 1:/);
      await page.keyboard.press("ArrowUp");
      await page.keyboard.press("ArrowLeft");
      await expect(first).toBeFocused();
      await page.keyboard.press("Enter");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("Escape");
      await expect(grid.locator('[aria-selected="true"]')).toHaveCount(0);
      expect(await foundCoords(grid)).toEqual([]);
      await page.keyboard.press("Space");
      await page.keyboard.press("Tab");
      await expect(grid.locator('[aria-selected="true"]')).toHaveCount(0);
      expect(await grid.evaluate((element) => element.contains(document.activeElement))).toBe(false);
      await first.focus();
      await page.keyboard.press("Enter");
      await page.mouse.move(1, 1);
      await expect(grid.locator('[aria-selected="true"]')).toHaveCount(1);
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
      await expect(page.getByRole("status").filter({ hasText: "Choose a straight" })).toBeVisible();
      expect(await foundCoords(grid)).toEqual([]);
      await first.focus();
      await page.keyboard.press("Enter");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
      await expect(page.getByRole("status").filter({ hasText: "No match yet" })).toBeVisible();
      expect(await foundCoords(grid)).toEqual([]);
      await first.focus();
      await page.keyboard.press("Enter");
      await page.getByRole("button", { name: mode === "preview" ? "Generate" : "Generate puzzle", exact: true }).click();
      await expect(grid.locator('[aria-selected="true"]')).toHaveCount(0);
      await expect(grid.locator('button[tabindex="0"]')).toHaveCount(1);
      await first.focus();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("status").filter({ hasText: "Selection started" })).toBeVisible();
      await page.keyboard.press("Escape");
      await page.getByLabel("Rows", { exact: true }).fill("6");
      await page.getByLabel("Columns", { exact: true }).fill("6");
      if (mode === "download") await page.getByRole("button", { name: "Generate puzzle", exact: true }).click();
      await expect(grid.locator("button")).toHaveCount(36);
      await expect(grid.locator('button[tabindex="0"]')).toHaveCount(1);
    });

    test("pointer drag marks the chosen duplicate instance only", async ({ page }) => {
      const grid = page.getByRole("grid", { name: /phoneme word search grid/i });
      const paths = await pathsIn(grid);
      const duplicates = paths.filter((path) => path.phonemes.join("|") === paths[0].phonemes.join("|"));
      expect(duplicates.length).toBeGreaterThan(1);
      const chosen = duplicates.at(-1)!;
      await grid.scrollIntoViewIfNeeded();
      const start = await tile(grid, chosen.coords[0]).boundingBox();
      const end = await tile(grid, chosen.coords.at(-1)!).boundingBox();
      expect(start).not.toBeNull();
      expect(end).not.toBeNull();
      await page.mouse.move(start!.x + start!.width / 2, start!.y + start!.height / 2);
      await page.mouse.down();
      await page.mouse.move(end!.x + end!.width / 2, end!.y + end!.height / 2, { steps: 12 });
      await page.mouse.up();
      await expect.poll(() => foundCoords(grid)).toEqual(chosen.coords.map((coord) => `${coord.row}-${coord.col}`).sort());
    });
  });
}
