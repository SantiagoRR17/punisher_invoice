import { expect, test } from "@playwright/test";

test.describe("Formulario de cotización", () => {
  test("redirige a /login cuando no hay sesión iniciada", async ({ page }) => {
    await page.goto("/cotizacion");

    await expect(page).toHaveURL(/\/login(\?|$)/);
  });
});
