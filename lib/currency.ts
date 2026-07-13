/**
 * Formatea un valor en pesos colombianos como en template_model.jpeg
 * (ej. 8900000 -> "$ 8'900.000,00"): separador de miles normal, pero el
 * separador de millones se reemplaza por un apóstrofe.
 */
export function formatCurrencyCOP(value: number): string {
  const formatted = new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  const firstDotIndex = formatted.indexOf(".");
  const secondDotIndex = formatted.indexOf(".", firstDotIndex + 1);

  if (firstDotIndex === -1 || secondDotIndex === -1) {
    return `$ ${formatted}`;
  }

  return `$ ${formatted.slice(0, firstDotIndex)}'${formatted.slice(firstDotIndex + 1)}`;
}
