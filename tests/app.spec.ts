import { test, expect } from "@playwright/test";

//npx playwright test --ui --headed

test.describe("ManageMe E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5173/", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    await page.evaluate(() => {
      localStorage.clear();

      localStorage.setItem(
        "manageme_current_user",
        JSON.stringify({
          id: "admin-test",
          email: "bednarskipiotrpawel@gmail.com",
          role: "admin",
          isBlocked: false,
        }),
      );
    });

    await page.reload({
      waitUntil: "domcontentloaded",
    });

    await expect(page.locator("body")).toContainText("ManageMe", {
      timeout: 15000,
    });
  });

  test("E2E flow aplikacji", async ({ page }) => {
    const projectName = page.locator('input[placeholder="Nazwa projektu"]');

    await projectName.fill("Projekt TEST");

    const projectDescription = page.locator(
      'input[placeholder="Opis projektu"]',
    );

    await projectDescription.fill("Opis TEST");

    const addProjectButton = page
      .locator("button")
      .filter({ hasText: /^Dodaj$/ })
      .first();

    await addProjectButton.click();

    await expect(page.locator("body")).toContainText("Projekt TEST", {
      timeout: 10000,
    });

    await page.waitForTimeout(3000);

    const editButtons = page.getByRole("button", {
      name: /Edytuj/i,
    });

    if ((await editButtons.count()) > 0) {
      await editButtons.first().click();

      await projectName.fill("Projekt EDIT");

      const saveButtons = page.getByRole("button", {
        name: /Zapisz/i,
      });

      if ((await saveButtons.count()) > 0) {
        await saveButtons.first().click();
      }
    }

    await page.waitForTimeout(2000);

    const chooseProjectButtons = page.getByRole("button", {
      name: /Wybierz projekt/i,
    });

    await chooseProjectButtons.first().click();

    await page.waitForTimeout(2000);

    const storyName = page.locator('input[placeholder="Nazwa historyjki"]');

    await storyName.fill("Story TEST");

    const storyDescription = page.locator(
      'input[placeholder="Opis historyjki"]',
    );

    await storyDescription.fill("Opis Story");

    const addStoryButtons = page.getByRole("button", {
      name: /Dodaj historyjkę/i,
    });

    await addStoryButtons.first().click();

    await expect(page.locator("body")).toContainText("Story TEST", {
      timeout: 10000,
    });

    await page.waitForTimeout(3000);

    const startButtons = page.getByRole("button", {
      name: /Start/i,
    });

    if ((await startButtons.count()) > 0) {
      await startButtons.first().click();
    }

    await page.waitForTimeout(2000);

    const chooseStoryButtons = page.getByRole("button", {
      name: /Wybierz story/i,
    });

    await chooseStoryButtons.first().click();

    await page.waitForTimeout(2000);

    const taskName = page.locator('input[placeholder="Nazwa zadania"]');

    await taskName.fill("Task TEST");

    const taskDescription = page.locator('input[placeholder="Opis zadania"]');

    await taskDescription.fill("Opis Task");

    const timeInput = page.locator('input[placeholder*="Czas"]');

    await timeInput.fill("5");

    const addTaskButtons = page.getByRole("button", {
      name: /Dodaj zadanie/i,
    });

    await addTaskButtons.first().click();

    await expect(page.locator("body")).toContainText("Task TEST", {
      timeout: 10000,
    });

    await page.waitForTimeout(3000);

    const finishButtons = page.getByRole("button", {
      name: /Zakończ/i,
    });

    if ((await finishButtons.count()) > 0) {
      await finishButtons.first().click();
    }

    await page.waitForTimeout(2000);

    const deleteButtons = page.getByRole("button", {
      name: /Usuń/i,
    });

    const deleteCount = await deleteButtons.count();

    for (let i = deleteCount - 1; i >= 0; i--) {
      await deleteButtons.nth(i).click();
      await page.waitForTimeout(500);
    }

    await expect(page.locator("body")).toContainText("ManageMe");
  });
});
