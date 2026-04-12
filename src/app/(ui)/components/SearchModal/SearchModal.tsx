"use client";

import type { Conversation } from "@/types";
import { normalizeText } from "@/utils/text";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { BsSearch } from "react-icons/bs";
import { createPortal } from "react-dom";
import css from "./SearchModal.module.scss";

dayjs.extend(relativeTime);

interface SearchModalProps {
  conversations: Conversation[];
  onClose: () => void;
  onSelect?: () => void;
}

export const SearchModal = ({ conversations, onClose, onSelect }: SearchModalProps) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = useMemo(() => {
    const q = normalizeText(query.trim());
    if (!q) return conversations;
    return conversations.filter((c) => normalizeText(c.title).includes(q));
  }, [query, conversations]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSelect = (id: string) => {
    router.push(`/chat/${id}`);
    onSelect?.();
    onClose();
  };

  return createPortal(
    <div className={css.overlay} onClick={onClose}>
      <div className={css.modal} onClick={(e) => e.stopPropagation()}>
        <div className={css.searchRow}>
          <BsSearch className={css.searchIcon} />
          <input
            ref={inputRef}
            className={css.input}
            placeholder="Search conversations…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {filtered.length > 0 ? (
          <ul className={css.list}>
            {filtered.map((c) => (
              <li key={c.id}>
                <button
                  className={css.item}
                  onClick={() => handleSelect(c.id)}
                >
                  <BsSearch className={css.itemIcon} />
                  <span className={css.itemLabel}>{c.title}</span>
                  <span className={css.itemTime}>{dayjs(c.updated_at).fromNow()}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={css.empty}>No conversations found</p>
        )}
      </div>
    </div>,
    document.body
  );
};
