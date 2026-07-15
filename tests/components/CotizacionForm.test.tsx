import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CotizacionForm from "@/components/CotizacionForm";

vi.mock("@react-pdf/renderer", () => ({
  pdf: () => ({ toBlob: async () => new Blob(["pdf"], { type: "application/pdf" }) }),
  Document: () => null,
  Page: () => null,
  View: () => null,
  Text: () => null,
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

describe("CotizacionForm", () => {
  it("muestra los campos del cliente y un ítem inicial", () => {
    render(<CotizacionForm />);

    expect(screen.getByLabelText("Nombre completo")).toBeInTheDocument();
    expect(screen.getByLabelText("Descripción del ítem 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Descargar PDF" })).toBeInTheDocument();
  });

  it("calcula el total de la fila y el total general en vivo", async () => {
    const user = userEvent.setup();
    render(<CotizacionForm />);

    await user.type(screen.getByLabelText("Cantidad del ítem 1"), "2");
    await user.type(screen.getByLabelText("Valor unitario del ítem 1"), "100");

    await waitFor(() => {
      expect(screen.getByText(/Total general: \$ 200,00/)).toBeInTheDocument();
    });
  });

  it("permite agregar y eliminar ítems", async () => {
    const user = userEvent.setup();
    render(<CotizacionForm />);

    await user.click(screen.getByRole("button", { name: "+ Agregar ítem" }));
    expect(screen.getByLabelText("Descripción del ítem 2")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Eliminar ítem 2" }));
    expect(screen.queryByLabelText("Descripción del ítem 2")).not.toBeInTheDocument();
  });

  it("muestra errores de validación cuando faltan datos obligatorios", async () => {
    const user = userEvent.setup();
    render(<CotizacionForm />);

    await user.click(screen.getByRole("button", { name: "Descargar PDF" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("El nombre del cliente es obligatorio.");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("guarda la cotización y descarga el PDF cuando los datos son válidos", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ id: "abc123", total: 200 }),
    });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    const user = userEvent.setup();
    render(<CotizacionForm />);

    await fillCliente(user);
    await user.type(screen.getByLabelText("Descripción del ítem 1"), "Portón levadizo");
    await user.type(screen.getByLabelText("Cantidad del ítem 1"), "2");
    await user.type(screen.getByLabelText("Valor unitario del ítem 1"), "100");

    await user.click(screen.getByRole("button", { name: "Descargar PDF" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/cotizaciones",
        expect.objectContaining({ method: "POST" })
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText("Cotización guardada y PDF descargado correctamente.")
      ).toBeInTheDocument();
    });

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });
});
