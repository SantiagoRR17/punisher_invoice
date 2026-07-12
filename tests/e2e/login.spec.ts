import { expect, test } from "@playwright/test";

test.describe("Pantalla de login", () => {
  test("muestra el formulario de acceso con usuario y contraseña", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByLabel("Usuario")).toBeVisible();
    await expect(page.getByLabel("Contraseña")).toBeVisible();
    await expect(page.getByRole("button", { name: "Ingresar" })).toBeVisible();
  });

  test("se ve correctamente en un viewport móvil", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/login");

    await expect(page.getByRole("button", { name: "Ingresar" })).toBeVisible();
  });
});
