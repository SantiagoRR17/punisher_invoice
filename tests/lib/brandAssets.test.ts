import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchFirmaDataUrl } from "@/lib/brandAssets";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchFirmaDataUrl", () => {
  it("devuelve un data URL cuando la firma existe", async () => {
    const blob = new Blob(["contenido-de-prueba"], { type: "image/png" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, blob: async () => blob })
    );

    const result = await fetchFirmaDataUrl();

    expect(result).toMatch(/^data:image\/png;base64,/);
  });

  it("devuelve undefined cuando el servidor responde 404 (firma no subida todavía)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 }));

    const result = await fetchFirmaDataUrl();

    expect(result).toBeUndefined();
  });

  it("devuelve undefined sin lanzar error cuando falla la petición", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network error")));

    const result = await fetchFirmaDataUrl();

    expect(result).toBeUndefined();
  });
});
