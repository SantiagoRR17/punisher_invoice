import Link from "next/link";
import CambiarPasswordForm from "@/components/CambiarPasswordForm";
import styles from "./perfil.module.css";

export default function PerfilPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.backLink} href="/menu">
          ← Volver al menú
        </Link>
        <h1 className={styles.title}>Cambiar contraseña</h1>
      </header>

      <div className={styles.content}>
        <CambiarPasswordForm />
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
