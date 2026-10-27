import { expect, test } from "@playwright/test";
import {
  confirmReady,
  finishSaltAndSoda,
  openB24187,
  resetDummies,
  setNet,
  waitWeighedNow,
  weighAndConfirm,
  weighThroughYellow,
} from "./helpers.ts";

test.beforeEach(async ({ request }) => {
  await resetDummies(request);
});

test("S1 loads queue from GET /api/batches and opens B-24187 from API", async ({ page }) => {
  const apiGets: string[] = [];
  page.on("request", (req) => {
    if (req.method() !== "GET" || !req.url().includes("/api/")) return;
    apiGets.push(new URL(req.url()).pathname);
  });

  await page.goto("/");
  await expect(page.getByTestId("screen-queue")).toBeVisible();
  await expect(page.getByTestId("batch-row-B-24187")).toBeVisible();
  await expect(page.getByTestId("batch-row-B-24188")).toBeVisible();
  await expect(page.getByTestId("batch-row-B-24190")).toBeVisible();
  await expect(page.getByTestId("batch-row-B-24191")).toBeVisible();

  await page.getByTestId("batch-row-B-24187").click();
  await expect(page.getByTestId("screen-weigh")).toBeVisible();
  await expect(page.getByTestId("crumb")).toContainText("B-24187");
  await expect(page.getByTestId("crumb")).toContainText("SO-9931");
  await expect(page.getByTestId("active-name")).toContainText("Blue RSPL");
  await expect(page.getByTestId("scale-badge")).toContainText("3 kg precision");

  expect(apiGets.some((p) => p === "/api/batches")).toBeTruthy();
  expect(apiGets).toContain("/api/batches/B-24187");
  expect(apiGets).toContain("/api/batches/B-24187/recipe");
});

test("training panel sets dummy weight and enables Confirm", async ({ page }) => {
  await openB24187(page);
  await expect(page.getByTestId("training-panel")).toBeVisible();
  await expect(page.getByTestId("dummy-weight-input")).toHaveValue("1240.0");
  await page.getByTestId("btn-set-dummy-weight").click();
  await waitWeighedNow(page, "1240.0");
  await expect(page.getByTestId("btn-confirm")).toBeEnabled();
  await expect(page.getByTestId("status-line")).toContainText("WITHIN TOLERANCE");
});

test("B-24187 happy path: five confirms, scale switch, ticket", async ({ page }) => {
  await openB24187(page);
  await weighThroughYellow(page);

  await setNet(page, "scale-3kg", 93.4);
  await waitWeighedNow(page, "93.4");
  await expect(page.getByTestId("btn-confirm")).toBeDisabled();
  await expect(page.getByTestId("status-line")).toContainText("DISPENSE");

  await setNet(page, "scale-3kg", 93.5);
  await waitWeighedNow(page, "93.5");
  await expect(page.getByTestId("btn-confirm")).toBeEnabled();

  await setNet(page, "scale-3kg", 94.6);
  await waitWeighedNow(page, "94.6");
  await expect(page.getByTestId("btn-confirm")).toBeDisabled();
  await expect(page.getByTestId("surplus")).toHaveClass(/on/);
  await expect(page.getByTestId("status-line")).toContainText("OVER TOLERANCE");

  await setNet(page, "scale-3kg", 94);
  await waitWeighedNow(page, "94.0");
  await expect(page.getByTestId("btn-confirm")).toBeEnabled();
  await confirmReady(page);

  await finishSaltAndSoda(page);

  await page.getByTestId("btn-print").click();
  const ticket = page.getByTestId("ticket-preview");
  await expect(ticket).toBeVisible();
  await expect(ticket).toContainText("FCI DYEING");
  await expect(ticket).toContainText("B-24187");
  await expect(ticket).toContainText("SO-9931");
  await expect(ticket).toContainText("JET-04");
  await expect(ticket).toContainText("Teal 4C");
  await expect(ticket).toContainText("R. Karim");
  await expect(ticket).toContainText("1240.0");
  await expect(ticket).toContainText("94.0");
  await expect(ticket).toContainText("24.000");
});
