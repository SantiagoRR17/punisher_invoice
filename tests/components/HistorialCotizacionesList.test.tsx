import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HistorialCotizacionesList from "@/components/HistorialCotizacionesList";

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

const cotizacionCompleta = {
  _id: "1",
  consecutivo: "COT-2026-0001",
  cliente: {
    tipoDocumento: "CC",
    tratamiento: "Señora",
    nombre: "Nohora Stella Coronado",
    cedula: "51.607.476",
    direccion: "Cl 74a #78 16",
    celular: "300 123 4567",
  },
  items: [{ descripcion: "Portón", cantidad: 1, valorUnitario: 1000 }],
  total: 1000,
  abono: 0,
  fecha: "2026-05-16T00:00:00.000Z",
};

// Cotización legacy (previa a features 010/011): sin consecutivo y con el
// cliente incompleto (sin nombre). Reproduce el crash del buscador.
const cotizacionLegacy = {
  _id: "2",
  consecutivo: "",
  cliente: {
    tipoDocumento: "CC",
    tratamiento: "Señora",
    cedula: "",
    direccion: "",
    celular: "",
  },
  items: [{ descripcion: "Reja antigua", cantidad: 1, valorUnitario: 500 }],
  total: 500,
  abono: 0,
  fecha: "2026-04-10T00:00:00.000Z",
};

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockImplementation(() =>
    Promise.resolve({ ok: true, json: async () => [cotizacionCompleta, cotizacionLegacy] })
  );
});

afterEach(() => {
  cleanup();
  fetchMock.mockReset();
  vi.restoreAllMocks();
});

describe("HistorialCotizacionesList — búsqueda con datos legacy", () => {
  it("no se cae al buscar cuando una cotización legacy no tiene nombre ni consecutivo", async () => {
    const user = userEvent.setup();
    render(<HistorialCotizacionesList />);

    // Ambas cotizaciones cargan (una legacy con cliente incompleto).
    expect(await screen.findByText("COT-2026-0001")).toBeInTheDocument();
    expect(screen.getByText("Nohora Stella Coronado")).toBeInTheDocument();

    // Al escribir en el buscador el filtro recorre TODAS las cotizaciones,
    // incluida la legacy sin nombre: antes esto lanzaba TypeError y tumbaba React.
    await user.type(
      screen.getByPlaceholderText("Buscar por consecutivo o cliente"),
      "Nohora"
    );

    // Sigue en pie y filtra correctamente.
    expect(screen.getByText("Nohora Stella Coronado")).toBeInTheDocument();
    expect(screen.queryByText("Reja antigua")).not.toBeInTheDocument();
  });
});
