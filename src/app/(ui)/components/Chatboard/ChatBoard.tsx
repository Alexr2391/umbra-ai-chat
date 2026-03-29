"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChatInput } from "@/app/(ui)/components/common/ChatInput/ChatInput";
import { PLACEHOLDERS } from "./constants";
import { MessageList } from "./MessageList";
import { useChat } from "./useChat";
import css from "./ChatBoard.module.scss";

interface ChatBoardProps {
  conversationId: string;
  initialMessages?: import("./useChat").Message[];
  firstMessage?: string;
}

export const ChatBoard = ({ conversationId, initialMessages = [], firstMessage }: ChatBoardProps) => {
  const [value, setValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (firstMessage) {
      router.replace(pathname);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { messages, isStreaming, lastIsEmpty, send } = useChat(messagesEndRef, {
    conversationId,
    initialMessages,
    firstMessage,
  });

  function handleSend() {
    const text = value.trim();
    if (!text || isStreaming) return;
    setValue("");
    send(text);
  }

  return (
    <div className={css.board}>
      <MessageList
        messages={messages}
        isStreaming={isStreaming}
        lastIsEmpty={lastIsEmpty}
        messagesEndRef={messagesEndRef}
      />
      <ChatInput
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onSend={handleSend}
        placeholder={PLACEHOLDERS.REPLY}
        isActive={value.trim().length > 0 && !isStreaming}
        disabled={isStreaming}
      />
    </div>
  );
};
