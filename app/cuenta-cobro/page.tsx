import Link from "next/link";
import CuentaCobroForm from "@/components/CuentaCobroForm";
import styles from "./cuenta-cobro.module.css";

export default function CuentaCobroPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.backLink} href="/menu">
          ← Volver al menú
        </Link>
        <h1 className={styles.title}>Cuenta de cobro</h1>
      </header>

      <div className={styles.content}>
        <CuentaCobroForm />
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
