import Link from "next/link";
import HistorialList from "@/components/HistorialList";
import styles from "./historial.module.css";

export default function HistorialPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.backLink} href="/menu">
          ← Volver al menú
        </Link>
        <h1 className={styles.title}>Historial de cuentas de cobro</h1>
      </header>

      <div className={styles.content}>
        <HistorialList />
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
