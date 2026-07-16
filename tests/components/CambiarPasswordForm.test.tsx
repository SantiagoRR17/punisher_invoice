import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CambiarPasswordForm from "@/components/CambiarPasswordForm";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  fetchMock.mockReset();
  vi.restoreAllMocks();
});

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  { actual, nueva, confirmar }: { actual: string; nueva: string; confirmar: string }
) {
  await user.type(screen.getByLabelText("Contraseña actual"), actual);
  await user.type(screen.getByLabelText("Contraseña nueva"), nueva);
  await user.type(screen.getByLabelText("Confirmar contraseña nueva"), confirmar);
}

describe("CambiarPasswordForm", () => {
  it("muestra los 3 campos y el botón de envío", () => {
    render(<CambiarPasswordForm />);

    expect(screen.getByLabelText("Contraseña actual")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña nueva")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirmar contraseña nueva")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cambiar contraseña" })).toBeInTheDocument();
  });

  it("muestra un error cuando la contraseña nueva es muy corta", async () => {
    const user = userEvent.setup();
    render(<CambiarPasswordForm />);

    await fillForm(user, { actual: "clave-actual", nueva: "corta", confirmar: "corta" });
    await user.click(screen.getByRole("button", { name: "Cambiar contraseña" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("La contraseña nueva debe tener al menos 8 caracteres.");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("muestra un error cuando la confirmación no coincide", async () => {
    const user = userEvent.setup();
    render(<CambiarPasswordForm />);

    await fillForm(user, {
      actual: "clave-actual",
      nueva: "clave-nueva-123",
      confirmar: "otra-clave-123",
    });
    await user.click(screen.getByRole("button", { name: "Cambiar contraseña" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("La confirmación no coincide con la contraseña nueva.");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("envía la petición y muestra el mensaje de éxito cuando los datos son válidos", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });

    const user = userEvent.setup();
    render(<CambiarPasswordForm />);

    await fillForm(user, {
      actual: "clave-actual",
      nueva: "clave-nueva-123",
      confirmar: "clave-nueva-123",
    });
    await user.click(screen.getByRole("button", { name: "Cambiar contraseña" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/perfil/password",
        expect.objectContaining({ method: "PATCH" })
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Contraseña actualizada correctamente.")).toBeInTheDocument();
    });

    expect(screen.getByLabelText("Contraseña actual")).toHaveValue("");
  });

  it("muestra el error del servidor cuando la contraseña actual es incorrecta", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ error: "La contraseña actual no es correcta." }),
    });

    const user = userEvent.setup();
    render(<CambiarPasswordForm />);

    await fillForm(user, {
      actual: "clave-mala",
      nueva: "clave-nueva-123",
      confirmar: "clave-nueva-123",
    });
    await user.click(screen.getByRole("button", { name: "Cambiar contraseña" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("La contraseña actual no es correcta.");
  });
});
