import { FcGoogle } from "react-icons/fc";
import { signInWithGoogle } from "./actions";
import css from "./page.module.scss";

export default function Home() {
  return (
    <main className={css.container}>
      <div className={css.card}>
        <h1 className={css.title}>Umbra</h1>
        <p className={css.subtitle}>Sign in to continue</p>

        <form action={signInWithGoogle}>
          <button type="submit" className={css.googleButton}>
            <FcGoogle size={20} />
            Continue with Google
          </button>
        </form>
      </div>
    </main>
  );
}
