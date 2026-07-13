import { expect, test } from "@playwright/test";

test.describe("Menú principal", () => {
  test("redirige a /login cuando no hay sesión iniciada", async ({ page }) => {
    await page.goto("/menu");

    await expect(page).toHaveURL(/\/login(\?|$)/);
  });
});
