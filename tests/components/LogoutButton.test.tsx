import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LogoutButton from "@/components/LogoutButton";

const signOutMock = vi.fn();

vi.mock("next-auth/react", () => ({
  signOut: (...args: unknown[]) => signOutMock(...args),
}));

afterEach(() => {
  cleanup();
  signOutMock.mockReset();
});

describe("LogoutButton", () => {
  it("muestra el botón de cerrar sesión", () => {
    render(<LogoutButton />);

    expect(
      screen.getByRole("button", { name: /cerrar sesión/i })
    ).toBeInTheDocument();
  });

  it("invoca signOut hacia /login al hacer clic", async () => {
    const user = userEvent.setup();
    render(<LogoutButton />);

    await user.click(screen.getByRole("button", { name: /cerrar sesión/i }));

    expect(signOutMock).toHaveBeenCalledWith({ callbackUrl: "/login" });
  });
});
