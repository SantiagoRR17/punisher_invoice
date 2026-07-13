import { expect, test } from "@playwright/test";

test.describe("Formulario de cuenta de cobro", () => {
  test("redirige a /login cuando no hay sesión iniciada", async ({ page }) => {
    await page.goto("/cuenta-cobro");

    await expect(page).toHaveURL(/\/login(\?|$)/);
  });
});
