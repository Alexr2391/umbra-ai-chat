import { auth } from "@/auth";
import css from "./page.module.scss";
import { NewChat } from "@/app/(ui)/components/NewChat/NewChat";

export default async function ChatPage() {
  const session = await auth();

  if (!session?.user) return null;

  return (
    <section className={css.container}>
      <div className={css.chatArea}>
        <NewChat userName={session.user.name} />
      </div>
    </section>
  );
}
