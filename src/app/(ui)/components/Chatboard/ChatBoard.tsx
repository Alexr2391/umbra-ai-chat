"use client";

import { useRef, useState } from "react";
import { ChatInput } from "@/app/(ui)/components/common/ChatInput/ChatInput";
import { PLACEHOLDERS } from "@/constants";
import { MessageList } from "./MessageList";
import { useChat } from "./useChat";
import css from "./ChatBoard.module.scss";

interface ChatBoardProps {
  conversationId: string;
  initialMessages?: import("./useChat").Message[];
}

export const ChatBoard = ({ conversationId, initialMessages = [] }: ChatBoardProps) => {
  const [value, setValue] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, isStreaming, isProcessingImage, lastIsEmpty, error, send } = useChat(messagesEndRef, {
    conversationId,
    initialMessages,
  });

  function handleSend(inputAnchor: HTMLTextAreaElement | null) {
    const text = value.trim();
    if (!text || isStreaming) return;
    const currentImage = image;
    setValue("");
    setImage(null);
    send(text, inputAnchor, currentImage ?? undefined);
  }

  return (
    <div className={css.board}>
      <MessageList
        messages={messages}
        isStreaming={isStreaming}
        isProcessingImage={isProcessingImage}
        lastIsEmpty={lastIsEmpty}
        messagesEndRef={messagesEndRef}
      />
      {error && (
        <p className={css.errorBanner}>{error}</p>
      )}
      <ChatInput
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onSend={handleSend}
        placeholder={PLACEHOLDERS.REPLY}
        isActive={value.trim().length > 0 && !isStreaming}
        disabled={isStreaming}
        image={image}
        onImageAttach={setImage}
        onImageRemove={() => setImage(null)}
      />
    </div>
  );
};
