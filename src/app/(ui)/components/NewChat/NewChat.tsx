"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createConversation } from "@/app/actions";
import { ChatInput } from "@/app/(ui)/components/common/ChatInput/ChatInput";
import { PLACEHOLDERS } from "@/app/(ui)/components/Chatboard/constants";
import css from "./NewChat.module.scss";

interface NewChatProps {
  userName: string | null | undefined;
}

export const NewChat = ({ userName }: NewChatProps) => {
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSend() {
    const text = value.trim();
    if (!text || isLoading) return;
    setIsLoading(true);
    try {
      const conversationId = await createConversation(text);
      router.push(`/chat/${conversationId}?first=${encodeURIComponent(text)}`);
    } catch (err) {
      console.error("Failed to create conversation:", err);
      setIsLoading(false);
    }
  }

  const firstName = userName?.split(" ")[0] ?? "there";

  return (
    <div className={css.container}>
      <h1 className={css.greeting}>Hello, {firstName}</h1>
      <p className={css.subtitle}>How can I help you today?</p>
      <ChatInput
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onSend={handleSend}
        placeholder={PLACEHOLDERS.NEW_CHAT}
        isActive={value.trim().length > 0 && !isLoading}
        disabled={isLoading}
      />
    </div>
  );
};
