import { expect, test } from "@playwright/test";
import { openB24187, resetDummies, setNet, waitWeighedNow, weighAndConfirm } from "./helpers.ts";

test.beforeEach(async ({ request }) => {
  await resetDummies(request);
});

test.afterEach(async ({ request }) => {
  await resetDummies(request);
});

test("OrgaTEX unavailable clears queue and shows failure", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.getByTestId("batch-row-B-24187")).toBeVisible();
  await request.post("/api/dummy/orgatex/unavailable", { data: { unavailable: true } });
  await expect(page.getByTestId("orgatex-strip")).toContainText("UNAVAILABLE");
  await expect(page.getByTestId("error-banner")).toContainText("OrgaTEX unavailable");
  await expect(page.getByTestId("batch-row-B-24187")).toHaveCount(0);
});

test("scale unavailable blocks Confirm", async ({ page, request }) => {
  await openB24187(page);
  await request.post("/api/dummy/scales/scale-3kg/unavailable", { data: { unavailable: true } });
  await expect(page.getByTestId("error-banner")).toContainText("Scale unavailable");
  await expect(page.getByTestId("btn-confirm")).toBeDisabled();
  await expect(page.getByTestId("status-line")).toContainText("SCALE UNAVAILABLE");
});

test("printer unavailable does not silently print", async ({ page, request }) => {
  await openB24187(page);
  await weighAndConfirm(page, "scale-3kg", 1240, "1240.0");
  await weighAndConfirm(page, "scale-3kg", 386, "386.0");
  await weighAndConfirm(page, "scale-3kg", 94, "94.0");
  await weighAndConfirm(page, "scale-32kg", 24, "24.000");
  await weighAndConfirm(page, "scale-32kg", 9.6, "9.600");
  await expect(page.getByTestId("orgatex-writeback")).toHaveText("CONFIRMED");
  await request.post("/api/dummy/printer/unavailable", { data: { unavailable: true } });
  await page.getByTestId("btn-print").click();
  await expect(page.getByTestId("error-banner")).toContainText("Printer unavailable");
  await expect(page.getByTestId("ticket-preview")).toHaveCount(0);
  await expect(page.getByTestId("printer-strip")).toContainText("UNAVAILABLE");
});

test("Re-tare zeros weighed now", async ({ page }) => {
  await openB24187(page);
  await setNet(page, "scale-3kg", 50);
  await waitWeighedNow(page, "50.0");
  await page.getByTestId("btn-tare").click();
  await waitWeighedNow(page, "0.0");
  await expect(page.getByTestId("screen-weigh")).toBeVisible();
});

test("Quit returns to queue without completing", async ({ page }) => {
  await openB24187(page);
  await page.getByTestId("btn-quit").click();
  await expect(page.getByTestId("screen-queue")).toBeVisible();
  await expect(page.getByTestId("screen-done")).toHaveCount(0);
  await expect(page.getByTestId("batch-row-B-24187")).toBeVisible();
});
