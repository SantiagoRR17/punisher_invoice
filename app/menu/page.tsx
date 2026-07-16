import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import styles from "./menu.module.css";

export default function MenuPage() {
  return (
    <main className={styles.background}>
      <div className={styles.card}>
        <h1 className={styles.title}>Menú principal</h1>
        <p className={styles.subtitle}>Elige qué quieres generar</p>

        <nav className={styles.links}>
          <Link className={styles.link} href="/cotizacion">
            Cotización
          </Link>
          <Link className={styles.link} href="/cuenta-cobro">
            Cuenta de cobro
          </Link>
          <Link className={styles.link} href="/historial">
            Historial
          </Link>
        </nav>

        <div className={styles.footer}>
          <Link className={styles.profileLink} href="/perfil">
            Cambiar contraseña
          </Link>
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}
