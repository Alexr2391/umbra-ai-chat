"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import type { Message } from "./useChat";
import css from "./ChatBoard.module.scss";
import { ROLES } from "@/constants";

interface MessageListProps {
  messages: Message[];
  isStreaming: boolean;
  isProcessingImage: boolean;
  lastIsEmpty: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const MessageList = ({
  messages,
  isStreaming,
  isProcessingImage,
  lastIsEmpty,
  messagesEndRef,
}: MessageListProps) => {
  return (
    <div role="log" aria-live="polite" aria-label="Chat messages" className={css.messages}>
      {messages.map((msg, i) => (
        <div key={i} className={css.message}>
          <div className={css[msg.role]}>
            {msg.imageDataUrl && (
              <Image
                src={msg.imageDataUrl}
                alt="Attached image"
                width={200}
                height={200}
                unoptimized
                className={css.messageImage}
              />
            )}
            {msg.role === ROLES.ASSISTANT ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.content}
              </ReactMarkdown>
            ) : (
              msg.content
            )}
          </div>
        </div>
      ))}
      {(isProcessingImage || isStreaming) && lastIsEmpty && (
        <div className={css.thinking}>
          {isProcessingImage ? "Processing image…" : "Thinking…"}
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
