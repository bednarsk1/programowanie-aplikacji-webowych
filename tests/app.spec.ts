import { test, expect } from "@playwright/test";

test("aplikacja uruchamia się poprawnie", async ({ page }) => {
  await page.goto("http://localhost:5173");

  await expect(page.locator("body")).toBeVisible();
});
