"use client";

import { signOut } from "next-auth/react";
import styles from "./LogoutButton.module.css";

export default function LogoutButton() {
  return (
    <button
      type="button"
      className={styles.button}
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Cerrar sesión
    </button>
  );
}
