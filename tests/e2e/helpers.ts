import { expect, type APIRequestContext, type Page } from "@playwright/test";

export async function resetDummies(request: APIRequestContext): Promise<void> {
  await request.post("/api/dummy/orgatex/unavailable", { data: { unavailable: false } });
  await request.post("/api/dummy/printer/unavailable", { data: { unavailable: false } });
  await request.post("/api/dummy/scales/scale-3kg/unavailable", { data: { unavailable: false } });
  await request.post("/api/dummy/scales/scale-32kg/unavailable", { data: { unavailable: false } });
  await request.post("/api/dummy/scales/scale-3kg/weight", { data: { net: 0 } });
  await request.post("/api/dummy/scales/scale-32kg/weight", { data: { net: 0 } });
}

export async function setNet(page: Page, scaleId: string, net: number): Promise<void> {
  const res = await page.request.post(`/api/dummy/scales/${scaleId}/weight`, { data: { net } });
  expect(res.ok(), `set net ${net} on ${scaleId}`).toBeTruthy();
}

export async function waitWeighedNow(page: Page, text: string): Promise<void> {
  await expect(page.getByTestId("weighed-now")).toHaveText(text);
}

export async function confirmReady(page: Page): Promise<void> {
  const btn = page.getByTestId("btn-confirm");
  await expect(btn).toBeEnabled();
  await btn.click();
}

export async function weighAndConfirm(
  page: Page,
  scaleId: string,
  net: number,
  nowText: string,
): Promise<void> {
  await setNet(page, scaleId, net);
  await waitWeighedNow(page, nowText);
  await confirmReady(page);
}

export async function openB24187(page: Page): Promise<void> {
  await page.goto("/");
  await expect(page.getByTestId("screen-queue")).toBeVisible();
  await expect(page.getByTestId("batch-row-B-24187")).toBeVisible();
  await page.getByTestId("batch-row-B-24187").click();
  await expect(page.getByTestId("screen-weigh")).toBeVisible();
  await expect(page.getByTestId("active-name")).toContainText("Blue RSPL");
}

export async function weighThroughYellow(page: Page): Promise<void> {
  await weighAndConfirm(page, "scale-3kg", 1240, "1240.0");
  await expect(page.getByTestId("active-name")).toContainText("Red RB");
  await weighAndConfirm(page, "scale-3kg", 386, "386.0");
  await expect(page.getByTestId("active-name")).toContainText("Yellow RGB");
}

export async function finishSaltAndSoda(page: Page): Promise<void> {
  await expect(page.getByTestId("active-name")).toContainText("Sodium Sulphate");
  await expect(page.getByTestId("scale-badge")).toContainText("32 kg floor");
  await weighAndConfirm(page, "scale-32kg", 24, "24.000");
  await expect(page.getByTestId("active-name")).toContainText("Soda Ash");
  await weighAndConfirm(page, "scale-32kg", 9.6, "9.600");
  await expect(page.getByTestId("screen-done")).toBeVisible();
  await expect(page.getByTestId("done-count")).toHaveText("5 of 5");
  await expect(page.getByTestId("orgatex-writeback")).toHaveText("CONFIRMED");
}
