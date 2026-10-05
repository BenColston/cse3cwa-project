import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const require = createRequire(new URL("../../frontend/package.json", import.meta.url));
const { chromium } = require("@playwright/test");
const fixtureDirectory = fileURLToPath(new URL("./fixtures/", import.meta.url));
await mkdir(fixtureDirectory, { recursive: true });
const browser = await chromium.launch();

try {
  const page = await browser.newPage();
  for (const [route, filename, heading] of [
    ["wordle", "wordle.html", "HCE Phoneme Wordle"],
    ["word-search", "word-search.html", "Phoneme Word Search"],
  ]) {
    await page.goto(`http://localhost:3000/${route}`);
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Generate HTML", exact: true }).click();
    const download = await downloadPromise;
    const path = fileURLToPath(new URL(`./fixtures/${filename}`, import.meta.url));
    await download.saveAs(path);
    const outputPage = await browser.newPage();
    try {
      await outputPage.goto(new URL(`./fixtures/${filename}`, import.meta.url).href);
      await outputPage.getByRole("heading", { name: heading, exact: true }).waitFor();
    } finally {
      await outputPage.close();
    }
    console.log(`Exported and opened ${filename}`);
  }
} finally {
  await browser.close();
}
