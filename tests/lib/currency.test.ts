import { describe, expect, it } from "vitest";
import { formatCurrencyCOP } from "@/lib/currency";

describe("formatCurrencyCOP", () => {
  it("usa apóstrofe como separador de millones, igual que el template", () => {
    expect(formatCurrencyCOP(8900000)).toBe("$ 8'900.000,00");
  });

  it("mantiene el punto como separador de miles cuando no hay millones", () => {
    expect(formatCurrencyCOP(900000)).toBe("$ 900.000,00");
  });

  it("formatea valores menores a mil sin separadores", () => {
    expect(formatCurrencyCOP(500)).toBe("$ 500,00");
  });

  it("conserva los decimales", () => {
    expect(formatCurrencyCOP(1234567.5)).toBe("$ 1'234.567,50");
  });
});
