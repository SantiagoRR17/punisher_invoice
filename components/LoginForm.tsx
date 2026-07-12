"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./LoginForm.module.css";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (!result || result.error) {
      setError("Usuario o contraseña inválidos.");
      return;
    }

    router.push("/menu");
  }

  return (
    <form className={styles.card} onSubmit={handleSubmit} noValidate>
      <h1 className={styles.title}>El Taller del Soldador</h1>
      <p className={styles.subtitle}>Ingresa con tu usuario autorizado</p>

      <label className={styles.label} htmlFor="username">
        Usuario
      </label>
      <input
        id="username"
        name="username"
        type="text"
        autoComplete="username"
        className={styles.input}
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        required
      />

      <label className={styles.label} htmlFor="password">
        Contraseña
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        className={styles.input}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <button className={styles.submit} type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
