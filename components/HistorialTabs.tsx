"use client";

import { useState } from "react";
import HistorialList from "./HistorialList";
import HistorialCotizacionesList from "./HistorialCotizacionesList";
import styles from "./HistorialTabs.module.css";

type Pestana = "cotizaciones" | "cuentas";

export default function HistorialTabs() {
  const [pestana, setPestana] = useState<Pestana>("cotizaciones");

  return (
    <div className={styles.wrapper}>
      <div className={styles.tabs} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={pestana === "cotizaciones"}
          className={pestana === "cotizaciones" ? styles.tabActive : styles.tab}
          onClick={() => setPestana("cotizaciones")}
        >
          Cotizaciones
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={pestana === "cuentas"}
          className={pestana === "cuentas" ? styles.tabActive : styles.tab}
          onClick={() => setPestana("cuentas")}
        >
          Cuentas de cobro
        </button>
      </div>

      <div role="tabpanel">
        {pestana === "cotizaciones" ? <HistorialCotizacionesList /> : <HistorialList />}
      </div>
    </div>
  );
}
