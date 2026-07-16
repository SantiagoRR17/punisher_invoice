"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { formatCurrencyCOP } from "@/lib/currency";
import { fetchFirmaDataUrl, fetchQrDataUrl } from "@/lib/brandAssets";
import type { TratamientoCliente } from "@/models/Cotizacion";
import styles from "./CotizacionForm.module.css";

interface ItemRow {
  id: number;
  descripcion: string;
  cantidad: string;
  valorUnitario: string;
}

interface ClienteFormState {
  tratamiento: TratamientoCliente;
  nombre: string;
  cedula: string;
  direccion: string;
  celular: string;
}

interface ParsedItem {
  descripcion: string;
  cantidad: number;
  valorUnitario: number;
}

let nextRowId = 1;

function createEmptyRow(): ItemRow {
  return { id: nextRowId++, descripcion: "", cantidad: "", valorUnitario: "" };
}

function parsePositiveNumber(value: string): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

export default function CotizacionForm() {
  const [cliente, setCliente] = useState<ClienteFormState>({
    tratamiento: "Señora",
    nombre: "",
    cedula: "",
    direccion: "",
    celular: "",
  });
  const [items, setItems] = useState<ItemRow[]>(() => [createEmptyRow()]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function updateCliente(field: keyof ClienteFormState, value: string) {
    setCliente((prev) => ({ ...prev, [field]: value }));
  }

  function updateItem(id: number, field: keyof Omit<ItemRow, "id">, value: string) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  }

  function addItem() {
    setItems((prev) => [...prev, createEmptyRow()]);
  }

  function removeItem(id: number) {
    setItems((prev) => (prev.length > 1 ? prev.filter((item) => item.id !== id) : prev));
  }

  function rowTotal(item: ItemRow): number {
    const cantidad = parsePositiveNumber(item.cantidad);
    const valorUnitario = parsePositiveNumber(item.valorUnitario);
    if (cantidad === null || valorUnitario === null) return 0;
    return cantidad * valorUnitario;
  }

  const totalGeneral = items.reduce((sum, item) => sum + rowTotal(item), 0);

  function validate(): { cliente: ClienteFormState; items: ParsedItem[] } | null {
    const newErrors: string[] = [];

    if (!cliente.nombre.trim()) newErrors.push("El nombre del cliente es obligatorio.");
    if (!cliente.celular.trim()) newErrors.push("El celular del cliente es obligatorio.");

    const parsedItems: ParsedItem[] = [];
    items.forEach((item, index) => {
      if (!item.descripcion.trim()) {
        newErrors.push(`El ítem ${index + 1} necesita una descripción.`);
        return;
      }
      const cantidad = parsePositiveNumber(item.cantidad);
      if (cantidad === null) {
        newErrors.push(`El ítem ${index + 1} necesita una cantidad válida mayor a cero.`);
        return;
      }
      const valorUnitario = parsePositiveNumber(item.valorUnitario);
      if (valorUnitario === null) {
        newErrors.push(`El ítem ${index + 1} necesita un valor unitario válido mayor a cero.`);
        return;
      }
      parsedItems.push({ descripcion: item.descripcion.trim(), cantidad, valorUnitario });
    });

    setErrors(newErrors);
    if (newErrors.length > 0) return null;

    return { cliente, items: parsedItems };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage(null);

    const validated = validate();
    if (!validated) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/cotizaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!response.ok) {
        setErrors(["No se pudo guardar la cotización. Intenta de nuevo."]);
        return;
      }

      const data = (await response.json()) as { total: number };
      const fecha = new Date();

      const [{ pdf }, { default: CotizacionPdf }, firmaUrl, qrUrl] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/pdf/CotizacionPdf"),
        fetchFirmaDataUrl(),
        fetchQrDataUrl(),
      ]);

      const blob = await pdf(
        <CotizacionPdf
          cotizacion={{
            cliente: validated.cliente,
            items: validated.items,
            fecha,
            total: data.total,
          }}
          firmaUrl={firmaUrl}
          qrUrl={qrUrl}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cotizacion-${validated.cliente.cedula}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setSuccessMessage("Cotización guardada y PDF descargado correctamente.");
    } catch {
      setErrors(["Ocurrió un error inesperado al generar la cotización."]);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Datos del cliente</legend>

        <div className={styles.grid}>
          <label className={styles.field}>
            <span className={styles.label}>Tratamiento</span>
            <select
              className={styles.input}
              value={cliente.tratamiento}
              onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                updateCliente("tratamiento", event.target.value)
              }
            >
              <option value="Señora">Señora</option>
              <option value="Señor">Señor</option>
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Nombre completo</span>
            <input
              className={styles.input}
              type="text"
              value={cliente.nombre}
              onChange={(event) => updateCliente("nombre", event.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Cédula</span>
            <input
              className={styles.input}
              type="text"
              value={cliente.cedula}
              onChange={(event) => updateCliente("cedula", event.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Dirección</span>
            <input
              className={styles.input}
              type="text"
              value={cliente.direccion}
              onChange={(event) => updateCliente("direccion", event.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Celular</span>
            <input
              className={styles.input}
              type="text"
              value={cliente.celular}
              onChange={(event) => updateCliente("celular", event.target.value)}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Ítems</legend>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Cantidad</th>
                <th>Valor unitario</th>
                <th>Valor total</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id}>
                  <td data-label="Descripción">
                    <textarea
                      className={styles.textarea}
                      aria-label={`Descripción del ítem ${index + 1}`}
                      value={item.descripcion}
                      onChange={(event) => updateItem(item.id, "descripcion", event.target.value)}
                      rows={2}
                    />
                  </td>
                  <td data-label="Cantidad">
                    <input
                      className={styles.numberInput}
                      aria-label={`Cantidad del ítem ${index + 1}`}
                      type="number"
                      min="0"
                      value={item.cantidad}
                      onChange={(event) => updateItem(item.id, "cantidad", event.target.value)}
                    />
                  </td>
                  <td data-label="Valor unitario">
                    <input
                      className={styles.numberInput}
                      aria-label={`Valor unitario del ítem ${index + 1}`}
                      type="number"
                      min="0"
                      value={item.valorUnitario}
                      onChange={(event) =>
                        updateItem(item.id, "valorUnitario", event.target.value)
                      }
                    />
                  </td>
                  <td className={styles.rowTotal} data-label="Valor total">
                    {formatCurrencyCOP(rowTotal(item))}
                  </td>
                  <td className={styles.actionCell}>
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                      aria-label={`Eliminar ítem ${index + 1}`}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button type="button" className={styles.addButton} onClick={addItem}>
          + Agregar ítem
        </button>

        <p className={styles.total}>Total general: {formatCurrencyCOP(totalGeneral)}</p>
      </fieldset>

      {errors.length > 0 && (
        <ul className={styles.errors} role="alert">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}

      {successMessage && <p className={styles.success}>{successMessage}</p>}

      <button className={styles.submit} type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Generando..." : "Descargar PDF"}
      </button>
    </form>
  );
}
