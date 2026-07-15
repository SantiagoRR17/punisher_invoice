import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CuentaCobroForm from "@/components/CuentaCobroForm";

vi.mock("@react-pdf/renderer", () => ({
  pdf: () => ({ toBlob: async () => new Blob(["pdf"], { type: "application/pdf" }) }),
  Document: () => null,
  Page: () => null,
  View: () => null,
  Text: () => null,
  Svg: () => null,
  Path: () => null,
  StyleSheet: { create: (styles: unknown) => styles },
}));

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  URL.createObjectURL = vi.fn(() => "blob:mock-url");
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  cleanup();
  fetchMock.mockReset();
  vi.restoreAllMocks();
});

async function fillCliente(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Nombre completo"), "Nohora Stella Coronado");
  await user.type(screen.getByLabelText("Cédula"), "51607476");
  await user.type(screen.getByLabelText("Dirección"), "Cl 74a #78 16");
  await user.type(screen.getByLabelText("Celular"), "300 123 4567");
}

describe("CuentaCobroForm", () => {
  it("muestra los campos del cliente, un ítem inicial y las opciones de abono", () => {
    render(<CuentaCobroForm />);

    expect(screen.getByLabelText("Nombre completo")).toBeInTheDocument();
    expect(screen.getByLabelText("Descripción del ítem 1")).toBeInTheDocument();
    expect(screen.getByText("Ninguno")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("60%")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Descargar PDF" })).toBeInTheDocument();
  });

  it("calcula el abono del 50% y el saldo pendiente en vivo", async () => {
    const user = userEvent.setup();
    render(<CuentaCobroForm />);

    await user.type(screen.getByLabelText("Cantidad del ítem 1"), "1");
    await user.type(screen.getByLabelText("Valor unitario del ítem 1"), "1000");
    await user.click(screen.getByText("50%"));

    await waitFor(() => {
      expect(screen.getByText(/Abono: \$ 500,00/)).toBeInTheDocument();
      expect(screen.getByText(/Saldo pendiente: \$ 500,00/)).toBeInTheDocument();
    });
  });

  it("muestra el campo de valor manual solo cuando se elige esa opción", async () => {
    const user = userEvent.setup();
    render(<CuentaCobroForm />);

    expect(screen.queryByLabelText("Valor del abono")).not.toBeInTheDocument();

    await user.click(screen.getByText("Valor manual"));

    expect(screen.getByLabelText("Valor del abono")).toBeInTheDocument();
  });

  it("muestra errores de validación cuando faltan datos obligatorios", async () => {
    const user = userEvent.setup();
    render(<CuentaCobroForm />);

    await user.click(screen.getByRole("button", { name: "Descargar PDF" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("El nombre del cliente es obligatorio.");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("guarda la cuenta de cobro y descarga el PDF cuando los datos son válidos", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        consecutivo: "CC-2026-0001",
        total: 1000,
        saldo: 1000,
        fecha: new Date().toISOString(),
      }),
    });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    const user = userEvent.setup();
    render(<CuentaCobroForm />);

    await fillCliente(user);
    await user.type(screen.getByLabelText("Descripción del ítem 1"), "Mantenimiento");
    await user.type(screen.getByLabelText("Cantidad del ítem 1"), "1");
    await user.type(screen.getByLabelText("Valor unitario del ítem 1"), "1000");

    await user.click(screen.getByRole("button", { name: "Descargar PDF" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/cuentas-cobro",
        expect.objectContaining({ method: "POST" })
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText("Cuenta de cobro CC-2026-0001 guardada y PDF descargado correctamente.")
      ).toBeInTheDocument();
    });

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });
});
