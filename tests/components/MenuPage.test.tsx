import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import MenuPage from "@/app/menu/page";

vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
}));

afterEach(() => {
  cleanup();
});

describe("MenuPage", () => {
  it("presenta los accesos a cotización, cuenta de cobro e historial", () => {
    render(<MenuPage />);

    expect(screen.getByRole("link", { name: /cotización/i })).toHaveAttribute(
      "href",
      "/cotizacion"
    );
    expect(
      screen.getByRole("link", { name: /cuenta de cobro/i })
    ).toHaveAttribute("href", "/cuenta-cobro");
    expect(screen.getByRole("link", { name: /historial/i })).toHaveAttribute(
      "href",
      "/historial"
    );
  });

  it("incluye el botón de cerrar sesión", () => {
    render(<MenuPage />);

    expect(
      screen.getByRole("button", { name: /cerrar sesión/i })
    ).toBeInTheDocument();
  });
});
