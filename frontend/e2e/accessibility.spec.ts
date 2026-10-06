import { expect, test } from "@playwright/test";
import { pathToFileURL } from "node:url";

test("Wordle source selector and preview groups have accessible names", async ({ page }) => {
  await page.goto("/wordle");
  const source = page.getByRole("combobox", { name: "Word source", exact: true });
  await expect(source).toBeVisible();
  await source.focus();
  await expect(source).toBeFocused();
  await expect(page.getByRole("group", { name: "Target phoneme hints", exact: true })).toBeVisible();
  await expect(page.getByRole("group", { name: "Submitted phoneme guesses", exact: true })).toBeVisible();
});

test("downloaded Word Search textarea is labelled and keyboard editable", async ({ page }, testInfo) => {
  await page.goto("/word-search");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Generate HTML", exact: true }).click();
  const download = await downloadPromise;
  const path = testInfo.outputPath(download.suggestedFilename());
  await download.saveAs(path);
  await page.goto(pathToFileURL(path).href);
  const words = page.getByRole("textbox", { name: "Words as space-separated phonemes", exact: true });
  await expect(words).toBeVisible();
  await words.focus();
  await expect(words).toBeFocused();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.insertText("t i n");
  await expect(words).toHaveValue("t i n");
  await page.getByRole("button", { name: "Generate puzzle", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#wordList")).toContainText("/t/ /i/ /n/");
  await expect(page.locator("#grid button")).toHaveCount(64);
});
