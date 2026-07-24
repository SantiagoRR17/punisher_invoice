import Link from "next/link";
import CuentaCobroForm, { type CuentaCobroInicial } from "@/components/CuentaCobroForm";
import { getCotizacion } from "@/services/cotizacionService";
import styles from "./cuenta-cobro.module.css";

export default async function CuentaCobroPage({
  searchParams,
}: {
  searchParams: Promise<{ cotizacion?: string }>;
}) {
  const { cotizacion: cotizacionId } = await searchParams;

  let initial: CuentaCobroInicial | undefined;
  if (cotizacionId) {
    const cotizacion = await getCotizacion(cotizacionId);
    if (cotizacion) {
      initial = {
        cliente: cotizacion.cliente,
        items: cotizacion.items,
        abono: cotizacion.abono,
      };
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.backLink} href="/menu">
          ← Volver al menú
        </Link>
        <h1 className={styles.title}>Cuenta de cobro</h1>
      </header>

      <div className={styles.content}>
        <CuentaCobroForm initial={initial} />
      </div>

      <footer className={styles.footer}>
        <span className={styles.footerIcon} aria-hidden="true">
          ⚒
        </span>
        <span>El Taller del Soldador — Soluciones metálicas con calidad, fuerza y compromiso</span>
      </footer>
    </main>
  );
}
