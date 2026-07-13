import Link from "next/link";
import CotizacionForm from "@/components/CotizacionForm";
import styles from "./cotizacion.module.css";

export default function CotizacionPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.backLink} href="/menu">
          ← Volver al menú
        </Link>
        <h1 className={styles.title}>Cotización</h1>
      </header>

      <div className={styles.content}>
        <CotizacionForm />
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
