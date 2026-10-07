import { expect, test } from "@playwright/test";

const api = "http://localhost:4080";

test("report switching is disabled while a sample mutation is pending", async ({ page }) => {
  await page.route("**/health", (route) => route.fulfill({ json: { status: "ok" } }));
  await page.route("**/metrics*", (route) => route.fulfill({ json: {
    simulationAvailable: false, wordLists: 0, activitiesCreated: 0,
    activitiesCreatedByType: { WORDLE: 0, WORD_SEARCH: 0 }, activityUsageByType: [],
    successfulGenerations: 0, failedGenerations: 0, totalGeneratedOutputs: 0,
    averageTimeOnPageMs: 0, pagesMeasured: 0,
  } }));
  let release!: () => void;
  const pending = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/simulation", async (route) => {
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "Content-Type" } });
      return;
    }
    await pending;
    await route.fulfill({ status: 201, json: { message: "Simulated records created." } });
  });
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Create sample records", exact: true }).click();
  try {
    await expect(page.getByRole("radio", { name: "Simulated demonstration", exact: true })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Refresh", exact: true })).toBeDisabled();
  } finally { release(); }
  await expect(page.getByRole("radio", { name: "Simulated demonstration", exact: true })).toBeChecked();
  await expect(page.getByRole("radio", { name: "Simulated demonstration", exact: true })).toBeEnabled();
});

test("sample records persist, report separately, and clean up without deleting teacher data", async ({ page, request }, testInfo) => {
  const initial = await (await request.get(`${api}/metrics`)).json();
  test.skip(initial.simulationAvailable, "Preserve a pre-existing user demonstration dataset.");
  const originalLists = (await (await request.get(`${api}/word-lists`)).json()).wordLists;
  const teacherResponse = await request.post(`${api}/word-lists`, { data: {
    name: "[Simulated] Classroom phoneme list",
    source: "Playwright teacher-owned safety record",
    words: [{ word: "tin", phonemes: ["t", "ɪ", "n"] }],
  } });
  expect(teacherResponse.status()).toBe(201);
  const teacher = (await teacherResponse.json()).wordList;
  let dependencyId: string | null = null;
  let ownsSimulation = false;
  try {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Create sample records", exact: true }).click();
    ownsSimulation = true;
    await expect(page.getByRole("radio", { name: "Simulated demonstration", exact: true })).toBeChecked();
    await expect(page.getByRole("main").getByRole("alert")).toContainText("Simulated warning: 1 failed generation");
    await expect(page.getByText("30.0 seconds", { exact: true })).toBeVisible();
    await expect(page.getByRole("row", { name: "Wordle 1 3", exact: true })).toBeVisible();
    await expect(page.getByRole("row", { name: "Word Search 1 5", exact: true })).toBeVisible();
    await page.reload();
    await page.getByRole("radio", { name: "Simulated demonstration", exact: true }).check();
    await expect(page.getByText("30.0 seconds", { exact: true })).toBeVisible();
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath("simulated-mobile.png"), fullPage: true });

    const repeats = await Promise.all([request.post(`${api}/simulation`), request.post(`${api}/simulation`)]);
    expect(repeats.map((response) => response.status())).toEqual([200, 200]);
    const simulated = await (await request.get(`${api}/metrics?source=simulated`)).json();
    expect(simulated).toMatchObject({ source: "simulated", wordLists: 1, activitiesCreated: 2,
      successfulGenerations: 5, failedGenerations: 1, averageTimeOnPageMs: 30000, pagesMeasured: 3,
      totalGeneratedOutputs: 0, activitiesCreatedByType: { WORDLE: 1, WORD_SEARCH: 1 } });
    const recorded = await (await request.get(`${api}/metrics`)).json();
    expect(recorded.failedGenerations).toBe(initial.failedGenerations);
    expect(recorded.activitiesCreated).toBe(initial.activitiesCreated);
    expect(recorded.wordLists).toBe(initial.wordLists + 1);

    const lists = (await (await request.get(`${api}/word-lists`)).json()).wordLists;
    const sample = lists.find((list: { simulationBatchId: string | null }) => list.simulationBatchId === "classroom-demo-v1");
    expect(sample.words).toHaveLength(5);
    expect(sample.words.find((word: { word: string }) => word.word === "jam").phonemes).toEqual(["dʒ", "æ", "m"]);
    await page.goto("/saved-data");
    await expect(page.getByText("Simulated demonstration record", { exact: true })).toHaveCount(3);

    const dependency = await request.post(`${api}/activities`, { data: {
      name: "Teacher-owned configuration using sample input", type: "WORDLE", difficulty: "EASY",
      wordListId: sample.id, settings: { targetEnglish: "thin" },
    } });
    expect(dependency.status()).toBe(201);
    dependencyId = (await dependency.json()).activity.id;
    await page.goto("/dashboard");
    page.once("dialog", (dialog) => dialog.dismiss());
    await page.getByRole("button", { name: "Remove sample records", exact: true }).click();
    expect((await (await request.get(`${api}/metrics?source=simulated`)).json()).wordLists).toBe(1);
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Remove sample records", exact: true }).click();
    await expect(page.getByRole("main").getByRole("alert")).toContainText("Removal blocked");
    expect((await request.get(`${api}/activities/${dependencyId}`)).status()).toBe(200);
    expect((await request.delete(`${api}/activities/${dependencyId}`)).status()).toBe(204);
    dependencyId = null;
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Remove sample records", exact: true }).click();
    await expect(page.getByText("No simulated records", { exact: false })).toBeVisible();
    expect((await (await request.get(`${api}/metrics?source=simulated`)).json()).activitiesCreated).toBe(0);
    expect((await request.get(`${api}/word-lists/${teacher.id}`)).status()).toBe(200);
    for (const list of originalLists) {
      const persisted = await request.get(`${api}/word-lists/${list.id}`);
      expect(persisted.status()).toBe(200);
      expect((await persisted.json()).wordList).toEqual(list);
    }
  } finally {
    if (dependencyId) await request.delete(`${api}/activities/${dependencyId}`);
    if (ownsSimulation) expect((await request.delete(`${api}/simulation`)).status()).toBe(200);
    await request.delete(`${api}/word-lists/${teacher.id}`);
  }
});

test("concurrent sample creation is idempotent and metrics sources are validated", async ({ request }) => {
  const initial = await (await request.get(`${api}/metrics`)).json();
  test.skip(initial.simulationAvailable, "Preserve a pre-existing user demonstration dataset.");
  try {
    const responses = await Promise.all([request.post(`${api}/simulation`), request.post(`${api}/simulation`)]);
    expect(responses.map((response) => response.status()).sort()).toEqual([200, 201]);
    expect((await (await request.get(`${api}/metrics?source=simulated`)).json()).wordLists).toBe(1);
    expect((await request.get(`${api}/metrics?source=invalid`)).status()).toBe(400);
    const preflight = await request.fetch(`${api}/simulation`, { method: "OPTIONS", headers: { Origin: "http://localhost:3000" } });
    expect(preflight.status()).toBe(204);
    expect(preflight.headers()["access-control-allow-origin"]).toBe("*");
  } finally {
    expect((await request.delete(`${api}/simulation`)).status()).toBe(200);
  }
});
