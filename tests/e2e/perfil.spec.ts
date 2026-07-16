import { expect, test } from "@playwright/test";

test.describe("Cambiar contraseña", () => {
  test("redirige a /login cuando no hay sesión iniciada", async ({ page }) => {
    await page.goto("/perfil");

    await expect(page).toHaveURL(/\/login(\?|$)/);
  });
});
