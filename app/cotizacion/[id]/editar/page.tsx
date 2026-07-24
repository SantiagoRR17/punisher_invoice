import Link from "next/link";
import { notFound } from "next/navigation";
import CotizacionForm from "@/components/CotizacionForm";
import { getCotizacion } from "@/services/cotizacionService";
import styles from "../../cotizacion.module.css";

export default async function EditarCotizacionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cotizacion = await getCotizacion(id);

  if (!cotizacion) {
    notFound();
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.backLink} href="/historial">
          ← Volver al historial
        </Link>
        <h1 className={styles.title}>Editar cotización {cotizacion.consecutivo}</h1>
      </header>

      <div className={styles.content}>
        <CotizacionForm
          initial={{
            id: cotizacion._id!,
            consecutivo: cotizacion.consecutivo,
            cliente: cotizacion.cliente,
            items: cotizacion.items,
            abono: cotizacion.abono,
          }}
        />
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
