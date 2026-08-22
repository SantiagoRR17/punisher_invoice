"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrencyCOP } from "@/lib/currency";
import { fetchFirmaDataUrl, fetchQrDataUrl } from "@/lib/brandAssets";
import type { ClienteCotizacion, ItemCotizacion } from "@/models/Cotizacion";
import styles from "./HistorialList.module.css";

interface CotizacionApi {
  _id?: string;
  consecutivo: string;
  cliente: ClienteCotizacion;
  items: ItemCotizacion[];
  total: number;
  abono: number;
  fecha: string;
}

function formatFechaCorta(fecha: string): string {
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(new Date(fecha));
}

export default function HistorialCotizacionesList() {
  const [cotizaciones, setCotizaciones] = useState<CotizacionApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [expandido, setExpandido] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cotizaciones")
      .then((response) => {
        if (!response.ok) throw new Error("No se pudo cargar el historial.");
        return response.json();
      })
      .then((data: CotizacionApi[]) => setCotizaciones(data))
      .catch(() => setLoadError("No se pudo cargar el historial de cotizaciones."))
      .finally(() => setIsLoading(false));
  }, []);

  const cotizacionesFiltradas = cotizaciones.filter((cotizacion) => {
    const texto = searchText.trim().toLowerCase();
    return (
      !texto ||
      (cotizacion.consecutivo ?? "").toLowerCase().includes(texto) ||
      (cotizacion.cliente?.nombre ?? "").toLowerCase().includes(texto)
    );
  });

  async function handleDescargarPdf(cotizacion: CotizacionApi) {
    const [{ pdf }, { default: CotizacionPdf }, firmaUrl, qrUrl] = await Promise.all([
      import("@react-pdf/renderer"),
      import("@/components/pdf/CotizacionPdf"),
      fetchFirmaDataUrl(),
      fetchQrDataUrl(),
    ]);

    const blob = await pdf(
      <CotizacionPdf
        cotizacion={{
          cliente: cotizacion.cliente,
          items: cotizacion.items,
          consecutivo: cotizacion.consecutivo,
          fecha: new Date(cotizacion.fecha),
          total: cotizacion.total,
          abono: cotizacion.abono,
        }}
        firmaUrl={firmaUrl}
        qrUrl={qrUrl}
      />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cotizacion-${cotizacion.consecutivo}.pdf`;
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
      </div>

      {cotizacionesFiltradas.length === 0 ? (
        <p className={styles.info}>No hay cotizaciones que coincidan con la búsqueda.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Consecutivo</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Abono</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {cotizacionesFiltradas.map((cotizacion) => {
                const rowKey = cotizacion._id ?? cotizacion.consecutivo;
                const estaExpandido = expandido === rowKey;

                return (
                  <Fragment key={rowKey}>
                    <tr>
                      <td data-label="Consecutivo">{cotizacion.consecutivo}</td>
                      <td data-label="Cliente">{cotizacion.cliente.nombre}</td>
                      <td data-label="Fecha">{formatFechaCorta(cotizacion.fecha)}</td>
                      <td data-label="Total">{formatCurrencyCOP(cotizacion.total)}</td>
                      <td data-label="Abono">{formatCurrencyCOP(cotizacion.abono)}</td>
                      <td className={styles.actions}>
                        <button
                          type="button"
                          className={styles.linkButton}
                          onClick={() => setExpandido(estaExpandido ? null : rowKey)}
                        >
                          {estaExpandido ? "Ocultar" : "Ver detalle"}
                        </button>
                        <button
                          type="button"
                          className={styles.linkButton}
                          onClick={() => handleDescargarPdf(cotizacion)}
                        >
                          Descargar PDF
                        </button>
                        {cotizacion._id && (
                          <Link
                            className={styles.linkButton}
                            href={`/cotizacion/${cotizacion._id}/editar`}
                          >
                            Editar
                          </Link>
                        )}
                        {cotizacion._id && (
                          <Link
                            className={styles.linkButton}
                            href={`/cuenta-cobro?cotizacion=${cotizacion._id}`}
                          >
                            Generar cuenta de cobro
                          </Link>
                        )}
                      </td>
                    </tr>

                    {estaExpandido && (
                      <tr>
                        <td colSpan={6} className={styles.detailCell}>
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
                                {cotizacion.items.map((item, index) => (
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

                            <p className={styles.info}>
                              Abono: {formatCurrencyCOP(cotizacion.abono)} — Saldo:{" "}
                              {formatCurrencyCOP(cotizacion.total - cotizacion.abono)}
                            </p>
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
