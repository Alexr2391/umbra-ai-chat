"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message } from "./useChat";
import css from "./ChatBoard.module.scss";
import { ROLES } from "@/constants";

interface MessageListProps {
  messages: Message[];
  isStreaming: boolean;
  lastIsEmpty: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const MessageList = ({
  messages,
  isStreaming,
  lastIsEmpty,
  messagesEndRef,
}: MessageListProps) => {
  return (
    <div className={css.messages}>
      {messages.map((msg, i) => (
        <div key={i} className={css.message}>
          <div className={css[msg.role]}>
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
      {isStreaming && lastIsEmpty && (
        <div className={css.thinking}>Thinking…</div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
