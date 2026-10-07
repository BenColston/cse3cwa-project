import { expect, test } from "@playwright/test";
import { pathToFileURL } from "node:url";
import { generateWordleHtml } from "../lib/htmlGenerators";
import { wordleActivity, type CorpusWord } from "../lib/activityData";

test("standalone Wordle stays compact across phoneme lengths and viewports", async ({ page }, testInfo) => {
  const targets: CorpusWord[] = [
    { english: "jam", phonemes: ["dʒ", "æ", "m"], difficulty: "3 phonemes" },
    { english: "chipmunk", phonemes: ["tʃ", "ɪ", "p", "m", "ɐ", "ŋ", "k"], difficulty: "5 phonemes" },
    { english: "test", phonemes: ["t", "e", "s", "t"], difficulty: "4 phonemes" },
    { english: "stamp", phonemes: ["s", "t", "æ", "m", "p"], difficulty: "5 phonemes" },
  ];
  for (const target of targets) {
    await page.goto("about:blank");
    await page.setContent(generateWordleHtml({ ...wordleActivity, target }));
    for (const [width, height] of [[1280, 900], [820, 1180], [390, 844], [320, 800]]) {
      await page.setViewportSize({ width, height });
      const size = await page.locator(".wordle-row .cell").first().boundingBox();
      expect(size!.height).toBe(48);
      expect(size!.width).toBeLessThanOrEqual(56);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      const board = await page.locator("#board").boundingBox();
      expect(board!.height).toBeLessThanOrEqual(wordleActivity.maxGuesses * 56);
      if (width === 1280) {
        const keyboard = await page.locator(".keyboard").boundingBox();
        expect(keyboard!.y + keyboard!.height).toBeLessThanOrEqual(height);
        await expect(page.getByRole("button", { name: "Check phonemes", exact: true })).toBeInViewport();
      }
    }
    for (const symbol of target.phonemes) await page.getByRole("button", { name: symbol, exact: true }).click();
    await page.getByRole("button", { name: "Check phonemes", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("Correct.");
  }
  await page.screenshot({ path: testInfo.outputPath("compact-mobile.png"), fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({ path: testInfo.outputPath("compact-desktop.png"), fullPage: true });
});

test("downloaded Wordle uses the compact layout and current assignment copy is preserved", async ({ page }, testInfo) => {
  await page.goto("/wordle");
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Generate HTML", exact: true }).click();
  const download = await pending;
  const path = testInfo.outputPath(download.suggestedFilename());
  await download.saveAs(path);
  await page.goto(pathToFileURL(path).href);
  await expect(page.locator(".wordle-layout")).toBeVisible();
  expect((await page.locator(".wordle-row .cell").first().boundingBox())!.height).toBe(48);
  await page.goto("http://localhost:3000/about");
  await expect(page.getByRole("heading", { name: "A data-driven builder for Assessment 3.", exact: true })).toBeVisible();
  await expect(page.getByText("Placeholder for a video explanation.", { exact: true })).toBeVisible();
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /Assessment 3/);
  await page.goto("/saved-data");
  await expect(page.getByRole("main")).not.toContainText("Assignment 2");
});
