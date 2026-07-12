import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "@/components/LoginForm";

const pushMock = vi.fn();
const signInMock = vi.fn();

vi.mock("next-auth/react", () => ({
  signIn: (...args: unknown[]) => signInMock(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

afterEach(() => {
  cleanup();
  pushMock.mockReset();
  signInMock.mockReset();
});

describe("LoginForm", () => {
  it("muestra los campos de usuario y contraseña", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText("Usuario")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ingresar/i })).toBeInTheDocument();
  });

  it("redirige al menú principal cuando las credenciales son correctas", async () => {
    signInMock.mockResolvedValue({ error: null, ok: true });
    const user = userEvent.setup();

    render(<LoginForm />);
    await user.type(screen.getByLabelText("Usuario"), "dueno.taller");
    await user.type(screen.getByLabelText("Contraseña"), "clave-correcta");
    await user.click(screen.getByRole("button", { name: /ingresar/i }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/menu"));
  });

  it("muestra un mensaje de error cuando las credenciales son inválidas", async () => {
    signInMock.mockResolvedValue({ error: "CredentialsSignin", ok: false });
    const user = userEvent.setup();

    render(<LoginForm />);
    await user.type(screen.getByLabelText("Usuario"), "dueno.taller");
    await user.type(screen.getByLabelText("Contraseña"), "clave-incorrecta");
    await user.click(screen.getByRole("button", { name: /ingresar/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Usuario o contraseña inválidos."
    );
    expect(pushMock).not.toHaveBeenCalled();
  });
});
