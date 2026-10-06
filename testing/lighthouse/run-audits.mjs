import lighthouse from "lighthouse";
import { launch } from "chrome-launcher";
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const require = createRequire(new URL("../../frontend/package.json", import.meta.url));
const { chromium } = require("@playwright/test");
const label = process.argv[2] ?? "baseline";
if (!/^[a-z0-9-]+$/.test(label)) throw new Error("Use a lowercase audit label, e.g. baseline or after.");
const baseUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";
const apiUrl = process.env.API_URL ?? "http://localhost:4080";
const runDirectory = new URL(`./results/${label}-${new Date().toISOString().replaceAll(/[:.]/g, "-")}/`, import.meta.url);
await mkdir(runDirectory, { recursive: true });
for (const url of [baseUrl, `${apiUrl}/health`]) {
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`${url} returned ${response.status}. Start Docker services first.`);
}

const fixtures = new Map();
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  for (const [route, heading] of [["wordle", "HCE Phoneme Wordle"], ["word-search", "Phoneme Word Search"]]) {
    await page.goto(`${baseUrl}/${route}`);
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Generate HTML", exact: true }).click();
    const download = await downloadPromise;
    const path = fileURLToPath(new URL(`${route}.html`, runDirectory));
    await download.saveAs(path);
    const output = await browser.newPage();
    try {
      await output.goto(new URL(`${route}.html`, runDirectory).href);
      await output.getByRole("heading", { name: heading, exact: true }).waitFor();
    } finally {
      await output.close();
    }
    fixtures.set(`/${route}.html`, await readFile(path));
  }
} finally {
  await browser.close();
}

// Lighthouse needs HTTP URLs; serve only the two freshly downloaded activities.
const server = createServer((request, response) => {
  const html = fixtures.get(request.url);
  response.writeHead(html ? 200 : 404, { "Content-Type": "text/html; charset=utf-8" });
  response.end(html ?? "Not found");
});
await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolve);
});
const fixtureUrl = `http://127.0.0.1:${server.address().port}`;
const targets = [
  ...["home", "about", "wordle", "word-search", "saved-data", "settings"].map((name) => ({
    name, url: name === "home" ? baseUrl : `${baseUrl}/${name}`,
  })),
  ...["wordle", "word-search"].map((name) => ({ name: `generated-${name}`, url: `${fixtureUrl}/${name}.html` })),
];
const summary = { label, startedAt: new Date().toISOString(), baseUrl, apiUrl, results: [] };
try {
  for (const formFactor of ["desktop", "mobile"]) {
    for (const target of targets) {
      const chrome = await launch({ chromePath: chromium.executablePath(), chromeFlags: ["--headless=new"] });
      try {
        const result = await lighthouse(target.url, {
          port: chrome.port,
          onlyCategories: ["accessibility"],
          output: ["html", "json"],
          logLevel: "error",
          ...(formFactor === "desktop" ? { preset: "desktop" } : {}),
        });
        if (!result || result.lhr.runtimeError) throw new Error(JSON.stringify(result?.lhr.runtimeError ?? "No Lighthouse result"));
        const stem = `${target.name}-${formFactor}`;
        await writeFile(new URL(`${stem}.html`, runDirectory), result.report[0]);
        await writeFile(new URL(`${stem}.json`, runDirectory), result.report[1]);
        const refs = result.lhr.categories.accessibility.auditRefs;
        const failedAudits = refs.map(({ id }) => result.lhr.audits[id]).filter((audit) => audit.score === 0);
        const entry = {
          page: target.name,
          formFactor,
          score: result.lhr.categories.accessibility.score * 100,
          lighthouseVersion: result.lhr.lighthouseVersion,
          fetchTime: result.lhr.fetchTime,
          userAgent: result.lhr.environment.hostUserAgent,
          report: `${stem}.html`,
          failedAudits: failedAudits.map(({ id, title, details }) => ({
            id, title,
            items: details?.items?.map((item) => ({
              selector: item.node?.selector,
              snippet: item.node?.snippet,
              explanation: item.node?.explanation,
            })) ?? [],
          })),
        };
        summary.results.push(entry);
        await writeFile(new URL("summary.json", runDirectory), JSON.stringify(summary, null, 2));
        console.log(`${stem}: ${entry.score}/100; ${failedAudits.length} failed audits`);
      } finally {
        await chrome.kill();
      }
    }
  }
} finally {
  await new Promise((resolve) => server.close(resolve));
}
summary.finishedAt = new Date().toISOString();
await writeFile(new URL("summary.json", runDirectory), JSON.stringify(summary, null, 2));
console.log(`Reports: ${fileURLToPath(runDirectory)}`);
