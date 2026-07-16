"use client";

import { useState, type FormEvent } from "react";
import styles from "./CambiarPasswordForm.module.css";

const MIN_PASSWORD_NUEVA = 8;

export default function CambiarPasswordForm() {
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [passwordConfirmar, setPasswordConfirmar] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const newErrors: string[] = [];

    if (!passwordActual) {
      newErrors.push("Ingresa tu contraseña actual.");
    }

    if (passwordNueva.length < MIN_PASSWORD_NUEVA) {
      newErrors.push(`La contraseña nueva debe tener al menos ${MIN_PASSWORD_NUEVA} caracteres.`);
    }

    if (passwordNueva !== passwordConfirmar) {
      newErrors.push("La confirmación no coincide con la contraseña nueva.");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/perfil/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passwordActual, passwordNueva }),
      });

      const data = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setErrors([data?.error ?? "No se pudo cambiar la contraseña. Intenta de nuevo."]);
        return;
      }

      setPasswordActual("");
      setPasswordNueva("");
      setPasswordConfirmar("");
      setSuccessMessage("Contraseña actualizada correctamente.");
    } catch {
      setErrors(["Ocurrió un error inesperado al cambiar la contraseña."]);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className={styles.card} onSubmit={handleSubmit} noValidate>
      <label className={styles.label} htmlFor="passwordActual">
        Contraseña actual
      </label>
      <input
        id="passwordActual"
        name="passwordActual"
        type="password"
        autoComplete="current-password"
        className={styles.input}
        value={passwordActual}
        onChange={(event) => setPasswordActual(event.target.value)}
      />

      <label className={styles.label} htmlFor="passwordNueva">
        Contraseña nueva
      </label>
      <input
        id="passwordNueva"
        name="passwordNueva"
        type="password"
        autoComplete="new-password"
        className={styles.input}
        value={passwordNueva}
        onChange={(event) => setPasswordNueva(event.target.value)}
      />

      <label className={styles.label} htmlFor="passwordConfirmar">
        Confirmar contraseña nueva
      </label>
      <input
        id="passwordConfirmar"
        name="passwordConfirmar"
        type="password"
        autoComplete="new-password"
        className={styles.input}
        value={passwordConfirmar}
        onChange={(event) => setPasswordConfirmar(event.target.value)}
      />

      {errors.length > 0 && (
        <ul className={styles.errors} role="alert">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}

      {successMessage && <p className={styles.success}>{successMessage}</p>}

      <button className={styles.submit} type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : "Cambiar contraseña"}
      </button>
    </form>
  );
}
