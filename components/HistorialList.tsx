"use client";

import { Fragment, useEffect, useState } from "react";
import { formatCurrencyCOP } from "@/lib/currency";
import { fetchFirmaDataUrl } from "@/lib/brandAssets";
import type { ClienteCuentaCobro, ItemCuentaCobro } from "@/models/CuentaCobro";
import styles from "./HistorialList.module.css";

type EstadoFiltro = "todas" | "pendientes" | "pagadas";

interface AbonoApi {
  valor: number;
  fecha: string;
}

interface CuentaCobroApi {
  _id?: string;
  consecutivo: string;
  cliente: ClienteCuentaCobro;
  items: ItemCuentaCobro[];
  total: number;
  abonos: AbonoApi[];
  saldo: number;
  fecha: string;
}

function formatFechaCorta(fecha: string): string {
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(new Date(fecha));
}

export default function HistorialList() {
  const [cuentas, setCuentas] = useState<CuentaCobroApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>("todas");
  const [expandido, setExpandido] = useState<string | null>(null);
  const [abonoInputs, setAbonoInputs] = useState<Record<string, string>>({});
  const [rowMessages, setRowMessages] = useState<Record<string, string>>({});
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [busyConsecutivo, setBusyConsecutivo] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cuentas-cobro")
      .then((response) => {
        if (!response.ok) throw new Error("No se pudo cargar el historial.");
        return response.json();
      })
      .then((data: CuentaCobroApi[]) => setCuentas(data))
      .catch(() => setLoadError("No se pudo cargar el historial de cuentas de cobro."))
      .finally(() => setIsLoading(false));
  }, []);

  const cuentasFiltradas = cuentas.filter((cuenta) => {
    const texto = searchText.trim().toLowerCase();
    const coincideTexto =
      !texto ||
      cuenta.consecutivo.toLowerCase().includes(texto) ||
      cuenta.cliente.nombre.toLowerCase().includes(texto);

    const pagada = cuenta.saldo <= 0;
    const coincideEstado =
      estadoFiltro === "todas" ||
      (estadoFiltro === "pagadas" && pagada) ||
      (estadoFiltro === "pendientes" && !pagada);

    return coincideTexto && coincideEstado;
  });

  async function registrarAbono(consecutivo: string, valor: number) {
    setRowErrors((prev) => ({ ...prev, [consecutivo]: "" }));
    setRowMessages((prev) => ({ ...prev, [consecutivo]: "" }));
    setBusyConsecutivo(consecutivo);

    try {
      const response = await fetch(`/api/cuentas-cobro/${consecutivo}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valor }),
      });

      const data = await response.json();

      if (!response.ok) {
        setRowErrors((prev) => ({ ...prev, [consecutivo]: data.error ?? "No se pudo registrar el abono." }));
        return;
      }

      setCuentas((prev) => prev.map((c) => (c.consecutivo === consecutivo ? data : c)));
      setAbonoInputs((prev) => ({ ...prev, [consecutivo]: "" }));
      setRowMessages((prev) => ({ ...prev, [consecutivo]: "Abono registrado correctamente." }));
    } catch {
      setRowErrors((prev) => ({ ...prev, [consecutivo]: "Ocurrió un error inesperado." }));
    } finally {
      setBusyConsecutivo(null);
    }
  }

  function handleRegistrarAbonoManual(cuenta: CuentaCobroApi) {
    const valor = Number(abonoInputs[cuenta.consecutivo]);
    if (!Number.isFinite(valor) || valor <= 0) {
      setRowErrors((prev) => ({
        ...prev,
        [cuenta.consecutivo]: "Ingresa un valor de abono válido mayor a cero.",
      }));
      return;
    }
    if (valor > cuenta.saldo) {
      setRowErrors((prev) => ({
        ...prev,
        [cuenta.consecutivo]: "El abono no puede ser mayor al saldo pendiente.",
      }));
      return;
    }
    registrarAbono(cuenta.consecutivo, valor);
  }

  async function handleDescargarPdf(cuenta: CuentaCobroApi) {
    const [{ pdf }, { default: CuentaCobroPdf }, firmaUrl] = await Promise.all([
      import("@react-pdf/renderer"),
      import("@/components/pdf/CuentaCobroPdf"),
      fetchFirmaDataUrl(),
    ]);

    const blob = await pdf(
      <CuentaCobroPdf
        cuenta={{
          cliente: cuenta.cliente,
          items: cuenta.items,
          consecutivo: cuenta.consecutivo,
          fecha: new Date(cuenta.fecha),
          total: cuenta.total,
          abonos: cuenta.abonos.map((abono) => ({ valor: abono.valor, fecha: new Date(abono.fecha) })),
          saldo: cuenta.saldo,
        }}
        firmaUrl={firmaUrl}
      />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cuenta-cobro-${cuenta.consecutivo}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  if (isLoading) {
    return <p className={styles.info}>Cargando historial...</p>;
  }

  if (loadError) {
    return (
      <p className={styles.info} role="alert">
        {loadError}
      </p>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Buscar por consecutivo o cliente"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
        <div className={styles.estadoOptions}>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="estadoFiltro"
              checked={estadoFiltro === "todas"}
              onChange={() => setEstadoFiltro("todas")}
            />
            Todas
          </label>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="estadoFiltro"
              checked={estadoFiltro === "pendientes"}
              onChange={() => setEstadoFiltro("pendientes")}
            />
            Pendientes
          </label>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="estadoFiltro"
              checked={estadoFiltro === "pagadas"}
              onChange={() => setEstadoFiltro("pagadas")}
            />
            Pagadas
          </label>
        </div>
      </div>

      {cuentasFiltradas.length === 0 ? (
        <p className={styles.info}>No hay cuentas de cobro que coincidan con la búsqueda.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Consecutivo</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Saldo</th>
                <th>Estado</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {cuentasFiltradas.map((cuenta) => {
                const pagada = cuenta.saldo <= 0;
                const estaExpandido = expandido === cuenta.consecutivo;

                return (
                  <Fragment key={cuenta.consecutivo}>
                    <tr>
                      <td data-label="Consecutivo">{cuenta.consecutivo}</td>
                      <td data-label="Cliente">{cuenta.cliente.nombre}</td>
                      <td data-label="Fecha">{formatFechaCorta(cuenta.fecha)}</td>
                      <td data-label="Total">{formatCurrencyCOP(cuenta.total)}</td>
                      <td data-label="Saldo">{formatCurrencyCOP(cuenta.saldo)}</td>
                      <td data-label="Estado">
                        <span className={pagada ? styles.badgePagada : styles.badgePendiente}>
                          {pagada ? "Pagada" : "Pendiente"}
                        </span>
                      </td>
                      <td className={styles.actions}>
                        <button
                          type="button"
                          className={styles.linkButton}
                          onClick={() =>
                            setExpandido(estaExpandido ? null : cuenta.consecutivo)
                          }
                        >
                          {estaExpandido ? "Ocultar" : "Ver detalle"}
                        </button>
                        <button
                          type="button"
                          className={styles.linkButton}
                          onClick={() => handleDescargarPdf(cuenta)}
                        >
                          Descargar PDF
                        </button>
                      </td>
                    </tr>

                    {estaExpandido && (
                      <tr>
                        <td colSpan={7} className={styles.detailCell}>
                          <div className={styles.detailContent}>
                            <table className={styles.itemsTable}>
                              <thead>
                                <tr>
                                  <th>Descripción</th>
                                  <th>Cantidad</th>
                                  <th>Valor unitario</th>
                                  <th>Valor total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {cuenta.items.map((item, index) => (
                                  <tr key={index}>
                                    <td data-label="Descripción">{item.descripcion}</td>
                                    <td data-label="Cantidad">{item.cantidad}</td>
                                    <td data-label="Valor unitario">
                                      {formatCurrencyCOP(item.valorUnitario)}
                                    </td>
                                    <td data-label="Valor total">
                                      {formatCurrencyCOP(item.cantidad * item.valorUnitario)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>

                            <div className={styles.abonosBlock}>
                              <h3 className={styles.abonosTitle}>Abonos registrados</h3>
                              {cuenta.abonos.length === 0 ? (
                                <p className={styles.info}>Sin abonos registrados todavía.</p>
                              ) : (
                                <ul className={styles.abonosList}>
                                  {cuenta.abonos.map((abono, index) => (
                                    <li key={index}>
                                      {formatCurrencyCOP(abono.valor)} — {formatFechaCorta(abono.fecha)}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>

                            {!pagada && (
                              <div className={styles.abonoForm}>
                                <label className={styles.field}>
                                  <span className={styles.label}>Nuevo abono</span>
                                  <input
                                    className={styles.numberInput}
                                    type="number"
                                    min="0"
                                    value={abonoInputs[cuenta.consecutivo] ?? ""}
                                    onChange={(event) =>
                                      setAbonoInputs((prev) => ({
                                        ...prev,
                                        [cuenta.consecutivo]: event.target.value,
                                      }))
                                    }
                                  />
                                </label>
                                <button
                                  type="button"
                                  className={styles.secondaryButton}
                                  disabled={busyConsecutivo === cuenta.consecutivo}
                                  onClick={() => handleRegistrarAbonoManual(cuenta)}
                                >
                                  Registrar abono
                                </button>
                                <button
                                  type="button"
                                  className={styles.primaryButton}
                                  disabled={busyConsecutivo === cuenta.consecutivo}
                                  onClick={() => registrarAbono(cuenta.consecutivo, cuenta.saldo)}
                                >
                                  Marcar como pagada
                                </button>
                              </div>
                            )}

                            {rowErrors[cuenta.consecutivo] && (
                              <p className={styles.error} role="alert">
                                {rowErrors[cuenta.consecutivo]}
                              </p>
                            )}
                            {rowMessages[cuenta.consecutivo] && (
                              <p className={styles.success}>{rowMessages[cuenta.consecutivo]}</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
