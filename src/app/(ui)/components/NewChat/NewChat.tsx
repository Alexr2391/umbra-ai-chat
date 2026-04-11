"use client";

import { ChatInput } from "@/app/(ui)/components/common/ChatInput/ChatInput";
import { useConversations } from "@/app/(ui)/context/ConversationsContext";
import { createConversation } from "@/app/actions";
import { PLACEHOLDERS, SESSION_KEYS } from "@/constants";
import { useRouter } from "next/navigation";
import { useState } from "react";
import css from "./NewChat.module.scss";

interface NewChatProps {
  userName: string | null | undefined;
}

export const NewChat = ({ userName }: NewChatProps) => {
  const [value, setValue] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { addConversation, replaceConversation, removeConversation } =
    useConversations();

  async function handleSend() {
    const text = value.trim();
    if (!text || isLoading) return;
    setIsLoading(true);

    const tempId = `optimistic-${Date.now()}`;
    addConversation({
      id: tempId,
      title: text.slice(0, 60),
      updated_at: new Date().toISOString(),
    });

    sessionStorage.setItem(SESSION_KEYS.PENDING_FIRST_MESSAGE, text);
    if (image) {
      sessionStorage.setItem(SESSION_KEYS.PENDING_IMAGE, image);
    }

    const conversationId = await createConversation(text);

    if (!conversationId) {
      removeConversation(tempId);
      sessionStorage.removeItem(SESSION_KEYS.PENDING_FIRST_MESSAGE);
      sessionStorage.removeItem(SESSION_KEYS.PENDING_IMAGE);
      setIsLoading(false);
      return;
    }

    replaceConversation(tempId, {
      id: conversationId,
      title: text.slice(0, 60),
      updated_at: new Date().toISOString(),
    });

    router.push(`/chat/${conversationId}`);
  }

  const firstName = userName?.split(" ")[0] ?? "there";

  return (
    <div className={css.container}>
      <h1 className={css.greeting}>Hello, {firstName}</h1>
      <p className={css.subtitle}>
        What do you want? Speak quickly... I have hexes to brew.
      </p>
      <ChatInput
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onSend={handleSend}
        placeholder={PLACEHOLDERS.NEW_CHAT}
        isActive={(value.trim().length > 0 || !!image) && !isLoading}
        disabled={isLoading}
        image={image}
        onImageAttach={setImage}
        onImageRemove={() => setImage(null)}
      />
    </div>
  );
};
