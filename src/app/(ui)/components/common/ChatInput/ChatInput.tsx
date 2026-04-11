"use client";

import { HINTS } from "@/app/(ui)/components/Chatboard/constants";
import { useEffect, useRef } from "react";
import { BsArrowUp, BsPaperclip } from "react-icons/bs";
import css from "./ChatInput.module.scss";

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSend: (anchor: HTMLTextAreaElement | null) => void;
  placeholder: string;
  disabled?: boolean;
  isActive: boolean;
}

export const ChatInput = ({
  value,
  onChange,
  onSend,
  placeholder,
  disabled = false,
  isActive,
}: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend(textareaRef.current);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
    onChange(e);
  }

  useEffect(() => {
    if (value === "" && textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value]);

  return (
    <div className={css.inputZone}>
      <div className={css.inputBox}>
        <textarea
          ref={textareaRef}
          className={css.textarea}
          placeholder={placeholder}
          value={value}
          rows={1}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />

        <div className={css.toolbar}>
          <div className={css.toolsLeft}>
            <button
              className={css.iconBtn}
              type="button"
              aria-label="Attach file"
            >
              <BsPaperclip className={css.icon} />
            </button>
          </div>

          <button
            className={`${css.sendBtn}${isActive ? ` ${css.active}` : ""}`}
            type="button"
            aria-label="Send message"
            onClick={() => onSend(textareaRef.current)}
            disabled={!isActive}
          >
            <BsArrowUp className={css.sendIcon} />
          </button>
        </div>
      </div>

      <p className={css.hint}>{HINTS.KEYBOARD}</p>
    </div>
  );
};
