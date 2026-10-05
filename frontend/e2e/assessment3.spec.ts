import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { pathToFileURL } from "node:url";

const apiUrl = "http://localhost:4080";

async function waitForApi(request: APIRequestContext) {
  await expect
    .poll(
      async () => {
        try {
          return (await request.get(`${apiUrl}/health`)).status();
        } catch {
          return 0;
        }
      },
      { message: "API health endpoint should respond", timeout: 60_000 },
    )
    .toBe(200);
}

function usageEvent(page: Page, eventType: string) {
  return page.waitForResponse(async (response) => {
    if (
      !response.url().endsWith("/metrics/events") ||
      response.request().method() !== "POST"
    ) {
      return false;
    }

    try {
      return response.request().postDataJSON().eventType === eventType;
    } catch {
      return false;
    }
  });
}

test("teachers can create, read, update, and delete a saved phoneme word list", async ({
  page,
  request,
}) => {
  await waitForApi(request);
  await page.goto("/saved-data");
  await expect(page.getByText("Connected", { exact: true })).toBeVisible();

  const name = `Playwright word list ${Date.now()}`;
  const listForm = page.locator("form").filter({
    has: page.getByRole("heading", { name: "Save word list" }),
  });
  let listId: string | undefined;
  let deleted = false;

  try {
    await listForm.getByLabel("Name").fill(name);
    await listForm
      .getByLabel("Description")
      .fill("Created by browser test");
    await listForm.getByLabel("Source").fill("Playwright E2E");
    await listForm
      .getByLabel("Words")
      .fill("thin | θ ɪ n | TH as in thin\nship | ʃ ɪ p | SH as in ship");

    const createdResponse = page.waitForResponse(
      (response) =>
        response.url() === `${apiUrl}/word-lists` &&
        response.request().method() === "POST",
    );
    await listForm.getByRole("button", { name: "Save to database" }).click();
    const createResponse = await createdResponse;
    expect(createResponse.status()).toBe(201);
    const created = (await createResponse.json()) as {
      wordList: { id: string };
    };
    listId = created.wordList.id;

    const listCard = page.locator("article").filter({
      has: page.getByRole("heading", { name }),
    });
    await expect(listCard).toContainText("2 words | Created by browser test");
    await expect(listCard).toContainText("Source: Playwright E2E");
    await expect(listCard).toContainText("θ ɪ n / ʃ ɪ p");

    const updateResponse = await request.put(
      `${apiUrl}/word-lists/${listId}`,
      {
        data: {
          name,
          description: "Updated by browser test",
          source: "Playwright update",
          words: [{ word: "tin", phonemes: ["t", "ɪ", "n"] }],
        },
      },
    );
    expect(updateResponse.status()).toBe(200);
    await page.getByRole("button", { name: "Refresh" }).click();
    await expect(listCard).toContainText("1 words | Updated by browser test");
    await expect(listCard).toContainText("Source: Playwright update");
    await expect(listCard).toContainText("t ɪ n");

    const deleteResponse = page.waitForResponse(
      (response) =>
        response.url() === `${apiUrl}/word-lists/${listId}` &&
        response.request().method() === "DELETE",
    );
    await listCard.getByRole("button", { name: "Delete" }).click();
    expect((await deleteResponse).status()).toBe(204);
    deleted = true;
    await expect(listCard).toHaveCount(0);
    await expect(page.getByText("Word list deleted")).toBeVisible();
  } finally {
    if (listId && !deleted) {
      await request.delete(`${apiUrl}/word-lists/${listId}`);
    }
  }
});

test("teachers can generate and play the standalone Wordle activity", async ({
  page,
  request,
}) => {
  await waitForApi(request);
  const activityUsed = usageEvent(page, "ACTIVITY_USED");
  await page.goto("/wordle");

  const activityUsedResponse = await activityUsed;
  expect(activityUsedResponse.status()).toBe(201);

  const download = page.waitForEvent("download");
  const generatedEvent = usageEvent(page, "GENERATION_SUCCEEDED");
  await page.getByRole("button", { name: "Generate HTML" }).click();
  const [downloadedFile, generationResponse] = await Promise.all([
    download,
    generatedEvent,
  ]);
  expect(downloadedFile.suggestedFilename()).toMatch(/\.html$/i);
  expect(generationResponse.status()).toBe(201);
  await expect(page.getByRole("status")).toContainText("HTML download started");

  const htmlPath = await downloadedFile.path();
  expect(htmlPath).not.toBeNull();
  const activityPage = await page.context().newPage();
  await activityPage.goto(pathToFileURL(htmlPath!).href);
  await expect(activityPage).toHaveTitle(/Wordle/i);
  await expect(
    activityPage.getByRole("heading", { name: "HCE Phoneme Wordle" }),
  ).toBeVisible();

  const targetHints = activityPage.locator(
    '[aria-label="Target phoneme hints"] .chip',
  );
  const hintCount = await targetHints.count();
  expect(hintCount).toBeGreaterThan(0);
  for (let index = 0; index < hintCount; index += 1) {
    const symbol = (await targetHints.nth(index).innerText())
      .trim()
      .replace(/^\/|\/$/g, "");
    await activityPage.getByRole("button", { name: symbol, exact: true }).click();
  }
  await activityPage.getByRole("button", { name: "Check phonemes" }).click();
  await expect(activityPage.getByRole("status")).toContainText("Correct.");

  const pageViewEvent = usageEvent(page, "PAGE_VIEW");
  await page.goto("/");
  expect((await pageViewEvent).status()).toBe(201);
  await activityPage.close();
});
