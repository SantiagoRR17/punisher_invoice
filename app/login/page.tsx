import LoginForm from "@/components/LoginForm";
import styles from "./login.module.css";

export default function LoginPage() {
  return (
    <main className={styles.background}>
      <LoginForm />
    </main>
  );
}
