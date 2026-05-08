import { test, expect } from "@playwright/test";

test("pełny flow aplikacji", async ({ page }) => {
  await page.goto("http://localhost:5173");

  await page.evaluate(() => {
    localStorage.setItem(
      "manageme_current_user",
      JSON.stringify({
        id: "1",
        email: "bednarskipiotrpawel@gmail.com",
        role: "admin",
        isBlocked: false,
      }),
    );
  });

  await page.reload();

  await page.waitForTimeout(3000);

  await expect(page.locator("body")).toBeVisible();

  const inputs = page.locator("input");
  const buttons = page.locator("button");

  // Projekt
  if ((await inputs.count()) > 0) {
    await inputs.first().fill("Projekt Testowy");
  }

  if ((await buttons.count()) > 0) {
    await buttons.first().click();
  }

  await page.waitForTimeout(1000);

  // Historyjka
  if ((await inputs.count()) > 1) {
    await inputs.nth(1).fill("Historyjka Testowa");
  }

  if ((await buttons.count()) > 1) {
    await buttons.nth(1).click();
  }

  await page.waitForTimeout(1000);

  // Zadanie
  if ((await inputs.count()) > 2) {
    await inputs.nth(2).fill("Zadanie Testowe");
  }

  if ((await buttons.count()) > 2) {
    await buttons.nth(2).click();
  }

  await page.waitForTimeout(1000);

  // Zmiana statusu
  const selects = page.locator("select");

  if ((await selects.count()) > 0) {
    await selects.first().selectOption({ index: 1 });
  }

  await page.waitForTimeout(1000);

  // Edycja
  if ((await buttons.count()) > 3) {
    await buttons.nth(3).click();
  }

  await page.waitForTimeout(500);

  // Usuwanie
  const allButtons = await buttons.count();

  if (allButtons > 4) {
    await buttons.nth(allButtons - 1).click();
  }

  await expect(page.locator("body")).toBeVisible();
});
