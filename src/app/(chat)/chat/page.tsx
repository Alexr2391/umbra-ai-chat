import { auth } from "@/auth";
import css from "./page.module.scss";
import { ChatBoard } from "@/app/(ui)/components/Chatboard/ChatBoard";

export default async function ChatPage() {
  const session = await auth();

  if (!session?.user) return null;

  return (
    <section className={css.container} >
      <div className={css.chatArea}>
      <ChatBoard />
      </div>
    </section>
  );
}
