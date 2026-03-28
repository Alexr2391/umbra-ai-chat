"use client";

import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import css from "./ChatBoard.module.scss";
import { useChat } from "./useChat";

export const ChatBoard = () => {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, isStreaming, lastIsEmpty, send } = useChat(messagesEndRef);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);

    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    const text = value.trim();
    if (!text || isStreaming) return;
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    send(text);
  }

  const hasContent = value.trim().length > 0;

  return (
    <div className={css.board}>
      <div className={css.messages}>
        {messages.map((msg, i) => (
          <div key={i} className={css.message}>
            <div className={css[msg.role]}>
              {msg.role === "assistant" ? (
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

      <div className={css.inputZone}>
        <div className={css.inputBox}>
          <textarea
            ref={textareaRef}
            className={css.textarea}
            placeholder="Reply..."
            value={value}
            rows={1}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />

          <div className={css.toolbar}>
            <div className={css.toolsLeft}>
              <button className={css.iconBtn} type="button" aria-label="Attach file">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.41a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </button>
            </div>

            <button
              className={`${css.sendBtn}${hasContent && !isStreaming ? ` ${css.active}` : ""}`}
              type="button"
              aria-label="Send message"
              onClick={handleSend}
              disabled={!hasContent || isStreaming}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </button>
          </div>
        </div>

        <p className={css.hint}>Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
};
