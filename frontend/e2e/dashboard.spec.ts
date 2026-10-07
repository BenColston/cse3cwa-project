import { expect, test } from "@playwright/test";

const metrics = {
  wordLists: 3, activitiesCreated: 5,
  activitiesCreatedByType: { WORDLE: 2, WORD_SEARCH: 3 },
  activityUsageByType: [{ type: "WORDLE", count: 8 }, { type: "WORD_SEARCH", count: 12 }],
  mostUsedActivityType: "WORD_SEARCH", successfulGenerations: 7,
  failedGenerations: 2, totalGeneratedOutputs: 4,
  averageTimeOnPageMs: 12500, pagesMeasured: 6,
};

test("dashboard reports API metrics and refreshes without retaining stale totals", async ({ page }) => {
  let fail = false;
  await page.route("**/health", (route) => route.fulfill({ json: { status: "ok", service: "cse3cwa-api" } }));
  await page.route("**/metrics", (route) => route.fulfill(fail ? { status: 500, json: { error: "Database unavailable" } } : { json: metrics }));
  await page.goto("/dashboard");
  await expect(page.getByText("API health: Healthy")).toBeVisible();
  await expect(page.getByText("12.5 seconds", { exact: true })).toBeVisible();
  await expect(page.getByText("Most-used activity: Word Search")).toBeVisible();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("2 failed generation events");
  await expect(page.getByRole("row", { name: "Wordle 2 8", exact: true })).toBeVisible();
  await expect(page.getByRole("row", { name: "Word Search 3 12", exact: true })).toBeVisible();
  fail = true;
  await page.getByRole("button", { name: "Refresh", exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Metrics unavailable");
  await expect(page.getByText("Dataset status unavailable", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create sample records", exact: true })).toBeDisabled();
  await expect(page.getByRole("region", { name: "Operational statistics" })).toHaveCount(0);
  fail = false;
  await page.getByRole("button", { name: "Refresh", exact: true }).click();
  await expect(page.getByText("12.5 seconds", { exact: true })).toBeVisible();
});

test("dashboard distinguishes empty data, tied usage and unavailable health", async ({ page }) => {
  await page.route("**/health", (route) => route.fulfill({ status: 503, json: { error: "Unavailable" } }));
  await page.route("**/metrics", (route) => route.fulfill({ json: { ...metrics, wordLists: 0, activitiesCreated: 0,
    activitiesCreatedByType: { WORDLE: 0, WORD_SEARCH: 0 }, activityUsageByType: [],
    pagesMeasured: 0, successfulGenerations: 0, failedGenerations: 0, totalGeneratedOutputs: 0 } }));
  await page.goto("/dashboard");
  await expect(page.getByText("API health: Unavailable")).toBeVisible();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("health check failed");
  await expect(page.getByText("No saved word lists.", { exact: false })).toBeVisible();
  await expect(page.getByText("Not recorded", { exact: true })).toBeVisible();
  await expect(page.getByText("Most-used activity: No usage recorded")).toBeVisible();
  await page.route("**/metrics", (route) => route.fulfill({ json: { ...metrics,
    activityUsageByType: [{ type: "WORDLE", count: 8 }, { type: "WORD_SEARCH", count: 8 }] } }));
  await page.getByRole("button", { name: "Refresh", exact: true }).click();
  await expect(page.getByText("Wordle and Word Search (tie)", { exact: true })).toBeVisible();
});

test("dashboard remains usable on mobile and supports compact navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/health", (route) => route.fulfill({ json: { status: "ok" } }));
  await page.route("**/metrics", (route) => route.fulfill({ json: metrics }));
  await page.goto("/dashboard");
  await expect(page.getByRole("table")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await expect(page.getByRole("navigation", { name: "Compact navigation" }).getByRole("link", { name: "Dashboard", exact: true })).toHaveAttribute("aria-current", "page");
});

test("dashboard displays a loading state before the metrics response", async ({ page }) => {
  await page.route("**/health", (route) => route.fulfill({ json: { status: "ok" } }));
  let release!: () => void;
  const waiting = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/metrics", async (route) => { await waiting; await route.fulfill({ json: metrics }); });
  await page.goto("/dashboard");
  try {
    await expect(page.getByRole("button", { name: "Refreshing...", exact: true })).toBeDisabled();
    await expect(page.getByText("Loading latest metrics...")).toBeVisible();
  } finally { release(); }
  await expect(page.getByText("12.5 seconds", { exact: true })).toBeVisible();
});

test("dashboard loads live database metrics across desktop and mobile themes", async ({ page }, testInfo) => {
  const response = page.waitForResponse((result) => result.url().endsWith("/metrics") && result.request().method() === "GET");
  await page.goto("/dashboard");
  const result = await response;
  expect(result.status()).toBe(200);
  const data = await result.json();
  await expect(page.getByText("API health: Healthy")).toBeVisible();
  await expect(page.locator("dl > div").filter({ has: page.getByText("Saved word lists", { exact: true }) }).locator("dd")).toHaveText(data.wordLists.toLocaleString("en-AU"));
  for (const [name, width, height] of [["desktop", 1440, 900], ["tablet", 820, 1180], ["mobile", 390, 844]] as const) {
    await page.setViewportSize({ width, height });
    for (const theme of ["light", "dark"]) {
      await page.evaluate((value) => { document.documentElement.dataset.theme = value; }, theme);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`${name}-${theme}.png`), fullPage: true });
    }
  }
});
