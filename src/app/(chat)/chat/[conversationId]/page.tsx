import { auth } from "@/auth";
import { getConversation, getConversationMessages } from "@/app/actions";
import { ChatBoard } from "@/app/(ui)/components/Chatboard/ChatBoard";
import { redirect } from "next/navigation";
import css from "../page.module.scss";

interface ConversationPageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const session = await auth();
  if (!session?.user) return null;

  const { conversationId } = await params;
  const [conversation, messages] = await Promise.all([
    getConversation(conversationId),
    getConversationMessages(conversationId),
  ]);

  if (!conversation) redirect("/chat");

  return (
    <section className={css.container}>
      <div className={css.chatArea}>
        <ChatBoard
          conversationId={conversationId}
          initialMessages={messages}
        />
      </div>
    </section>
  );
}
