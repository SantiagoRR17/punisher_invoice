"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { formatCurrencyCOP } from "@/lib/currency";
import { fetchFirmaDataUrl } from "@/lib/brandAssets";
import type { TratamientoCliente } from "@/models/CuentaCobro";
import styles from "./CuentaCobroForm.module.css";

type TipoAbono = "ninguno" | "50" | "60" | "manual";

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

export default function CuentaCobroForm() {
  const [cliente, setCliente] = useState<ClienteFormState>({
    tratamiento: "Señora",
    nombre: "",
    cedula: "",
    direccion: "",
    celular: "",
  });
  const [items, setItems] = useState<ItemRow[]>(() => [createEmptyRow()]);
  const [tipoAbono, setTipoAbono] = useState<TipoAbono>("ninguno");
  const [abonoManual, setAbonoManual] = useState("");
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

  function computeAbono(total: number): number {
    if (tipoAbono === "50") return total * 0.5;
    if (tipoAbono === "60") return total * 0.6;
    if (tipoAbono === "manual") return parsePositiveNumber(abonoManual) ?? 0;
    return 0;
  }

  const abonoCalculado = computeAbono(totalGeneral);
  const saldoCalculado = totalGeneral - abonoCalculado;

  function validate(): { cliente: ClienteFormState; items: ParsedItem[]; abonoInicial: number } | null {
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

    const total = parsedItems.reduce((sum, item) => sum + item.cantidad * item.valorUnitario, 0);

    let abonoInicial = 0;
    if (tipoAbono === "manual") {
      const manual = parsePositiveNumber(abonoManual);
      if (manual === null) {
        newErrors.push("El valor de abono manual debe ser mayor a cero.");
      } else {
        abonoInicial = manual;
      }
    } else if (tipoAbono === "50") {
      abonoInicial = total * 0.5;
    } else if (tipoAbono === "60") {
      abonoInicial = total * 0.6;
    }

    if (newErrors.length === 0 && abonoInicial > total) {
      newErrors.push("El abono no puede ser mayor al total de la cuenta.");
    }

    setErrors(newErrors);
    if (newErrors.length > 0) return null;

    return { cliente, items: parsedItems, abonoInicial };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage(null);

    const validated = validate();
    if (!validated) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/cuentas-cobro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!response.ok) {
        setErrors(["No se pudo guardar la cuenta de cobro. Intenta de nuevo."]);
        return;
      }

      const data = (await response.json()) as {
        consecutivo: string;
        total: number;
        saldo: number;
        fecha: string;
      };

      const [{ pdf }, { default: CuentaCobroPdf }, firmaUrl] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/pdf/CuentaCobroPdf"),
        fetchFirmaDataUrl(),
      ]);

      const fecha = new Date(data.fecha);
      const blob = await pdf(
        <CuentaCobroPdf
          cuenta={{
            cliente: validated.cliente,
            items: validated.items,
            consecutivo: data.consecutivo,
            fecha,
            total: data.total,
            abonos: validated.abonoInicial > 0 ? [{ valor: validated.abonoInicial, fecha }] : [],
            saldo: data.saldo,
          }}
          firmaUrl={firmaUrl}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cuenta-cobro-${data.consecutivo}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setSuccessMessage(
        `Cuenta de cobro ${data.consecutivo} guardada y PDF descargado correctamente.`
      );
    } catch {
      setErrors(["Ocurrió un error inesperado al generar la cuenta de cobro."]);
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

        <p className={styles.total}>Total: {formatCurrencyCOP(totalGeneral)}</p>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Abono inicial</legend>

        <div className={styles.abonoOptions}>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="tipoAbono"
              value="ninguno"
              checked={tipoAbono === "ninguno"}
              onChange={() => setTipoAbono("ninguno")}
            />
            Ninguno
          </label>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="tipoAbono"
              value="50"
              checked={tipoAbono === "50"}
              onChange={() => setTipoAbono("50")}
            />
            50%
          </label>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="tipoAbono"
              value="60"
              checked={tipoAbono === "60"}
              onChange={() => setTipoAbono("60")}
            />
            60%
          </label>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="tipoAbono"
              value="manual"
              checked={tipoAbono === "manual"}
              onChange={() => setTipoAbono("manual")}
            />
            Valor manual
          </label>
        </div>

        {tipoAbono === "manual" && (
          <label className={styles.field}>
            <span className={styles.label}>Valor del abono</span>
            <input
              className={styles.numberInput}
              type="number"
              min="0"
              value={abonoManual}
              onChange={(event) => setAbonoManual(event.target.value)}
            />
          </label>
        )}

        <div className={styles.resumen}>
          <p>Abono: {formatCurrencyCOP(abonoCalculado)}</p>
          <p className={styles.saldo}>Saldo pendiente: {formatCurrencyCOP(saldoCalculado)}</p>
        </div>
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
