import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HistorialList from "@/components/HistorialList";

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

const cuentaPendiente = {
  _id: "1",
  consecutivo: "CC-2026-0001",
  cliente: {
    tipoDocumento: "CC",
    tratamiento: "Señora",
    nombre: "Nohora Stella Coronado",
    cedula: "51.607.476",
    direccion: "Cl 74a #78 16",
    celular: "300 123 4567",
  },
  items: [{ descripcion: "Mantenimiento", cantidad: 1, valorUnitario: 1000 }],
  total: 1000,
  abonos: [],
  saldo: 1000,
  fecha: "2026-05-16T00:00:00.000Z",
};

const cuentaPagada = {
  ...cuentaPendiente,
  _id: "2",
  consecutivo: "CC-2026-0002",
  cliente: { ...cuentaPendiente.cliente, nombre: "Erick Dueñas" },
  abonos: [{ valor: 1000, fecha: "2026-05-17T00:00:00.000Z" }],
  saldo: 0,
};

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockImplementation((url: string, options?: RequestInit) => {
    if (!options || options.method === undefined) {
      return Promise.resolve({
        ok: true,
        json: async () => [cuentaPendiente, cuentaPagada],
      });
    }
    return Promise.resolve({ ok: true, json: async () => cuentaPendiente });
  });
  URL.createObjectURL = vi.fn(() => "blob:mock-url");
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  cleanup();
  fetchMock.mockReset();
  vi.restoreAllMocks();
});

describe("HistorialList", () => {
  it("carga y muestra el listado de cuentas de cobro", async () => {
    render(<HistorialList />);

    expect(await screen.findByText("CC-2026-0001")).toBeInTheDocument();
    expect(screen.getByText("CC-2026-0002")).toBeInTheDocument();
    expect(screen.getByText("Pendiente")).toBeInTheDocument();
    expect(screen.getByText("Pagada")).toBeInTheDocument();
  });

  it("filtra por texto de búsqueda", async () => {
    const user = userEvent.setup();
    render(<HistorialList />);
    await screen.findByText("CC-2026-0001");

    await user.type(screen.getByPlaceholderText("Buscar por consecutivo o cliente"), "Erick");

    expect(screen.queryByText("CC-2026-0001")).not.toBeInTheDocument();
    expect(screen.getByText("CC-2026-0002")).toBeInTheDocument();
  });

  it("filtra por estado pendientes", async () => {
    const user = userEvent.setup();
    render(<HistorialList />);
    await screen.findByText("CC-2026-0001");

    await user.click(screen.getByText("Pendientes"));

    expect(screen.getByText("CC-2026-0001")).toBeInTheDocument();
    expect(screen.queryByText("CC-2026-0002")).not.toBeInTheDocument();
  });

  it("muestra el detalle (ítems y abonos) al expandir una fila", async () => {
    const user = userEvent.setup();
    render(<HistorialList />);
    await screen.findByText("CC-2026-0001");

    const filas = screen.getAllByText("Ver detalle");
    await user.click(filas[0]);

    expect(screen.getByText("Mantenimiento")).toBeInTheDocument();
    expect(screen.getByText("Sin abonos registrados todavía.")).toBeInTheDocument();
  });

  it("registra un abono y actualiza el saldo mostrado", async () => {
    const user = userEvent.setup();
    fetchMock.mockImplementation((url: string, options?: RequestInit) => {
      if (!options) {
        return Promise.resolve({ ok: true, json: async () => [cuentaPendiente, cuentaPagada] });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ ...cuentaPendiente, saldo: 600, abonos: [{ valor: 400, fecha: "2026-05-18T00:00:00.000Z" }] }),
      });
    });

    render(<HistorialList />);
    await screen.findByText("CC-2026-0001");

    await user.click(screen.getAllByText("Ver detalle")[0]);
    await user.type(screen.getByLabelText("Nuevo abono"), "400");
    await user.click(screen.getByText("Registrar abono"));

    await waitFor(() => {
      expect(screen.getByText("Abono registrado correctamente.")).toBeInTheDocument();
    });

    const fila = screen.getByText("CC-2026-0001").closest("tr") as HTMLElement;
    expect(within(fila).getByText("$ 600,00")).toBeInTheDocument();
  });

  it("no permite un abono manual mayor al saldo pendiente", async () => {
    const user = userEvent.setup();
    render(<HistorialList />);
    await screen.findByText("CC-2026-0001");

    await user.click(screen.getAllByText("Ver detalle")[0]);
    await user.type(screen.getByLabelText("Nuevo abono"), "5000");
    await user.click(screen.getByText("Registrar abono"));

    expect(
      await screen.findByText("El abono no puede ser mayor al saldo pendiente.")
    ).toBeInTheDocument();
  });
});
