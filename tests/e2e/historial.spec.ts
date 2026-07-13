import { expect, test } from "@playwright/test";

test.describe("Historial de cuentas de cobro", () => {
  test("redirige a /login cuando no hay sesión iniciada", async ({ page }) => {
    await page.goto("/historial");

    await expect(page).toHaveURL(/\/login(\?|$)/);
  });
});
