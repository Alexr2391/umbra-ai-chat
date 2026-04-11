"use client";

import { HINTS, MAX_IMAGE_BYTES } from "@/constants";
import { useEffect, useRef, useState } from "react";
import { BsArrowUp, BsPaperclip, BsX } from "react-icons/bs";
import Image from "next/image";
import css from "./ChatInput.module.scss";

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSend: (anchor: HTMLTextAreaElement | null) => void;
  placeholder: string;
  disabled?: boolean;
  isActive: boolean;
  image?: string | null;
  onImageAttach?: (dataUrl: string) => void;
  onImageRemove?: () => void;
}

export const ChatInput = ({
  value,
  onChange,
  onSend,
  placeholder,
  disabled = false,
  isActive,
  image,
  onImageAttach,
  onImageRemove,
}: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setErrorMessage("Image must be under 10 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onImageAttach?.(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

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
    <>
      {errorMessage && (
        <div className={css.modalOverlay} onClick={() => setErrorMessage(null)}>
          <div className={css.modal} onClick={(e) => e.stopPropagation()}>
            <p className={css.modalMessage}>{errorMessage}</p>
            <button
              className={css.modalBtn}
              type="button"
              onClick={() => setErrorMessage(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

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

          {image && (
            <div className={css.imagePreview}>
              <Image
                src={image}
                alt="Attached"
                width={48}
                height={48}
                unoptimized
                className={css.thumbnail}
              />
              <button
                className={css.removeBtn}
                type="button"
                aria-label="Remove image"
                onClick={onImageRemove}
              >
                <BsX />
              </button>
            </div>
          )}

          <div className={css.toolbar}>
            <div className={css.toolsLeft}>
              <button
                className={css.iconBtn}
                type="button"
                aria-label="Attach image"
                onClick={() => fileInputRef.current?.click()}
              >
                <BsPaperclip className={css.icon} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className={css.hiddenInput}
                onChange={handleFileChange}
              />
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
    </>
  );
};
