"use client";

import { deleteConversation, renameConversation as renameAction } from "@/app/actions";
import { useConversations } from "@/app/(ui)/context/ConversationsContext";
import type { Conversation } from "@/types";
import classNames from "classnames";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BsPencil, BsThreeDots, BsTrash } from "react-icons/bs";
import css from "./ConversationItem.module.scss";

interface ConversationItemProps {
  conversation: Conversation;
  active: boolean;
  onClick?: () => void;
}

export const ConversationItem = ({
  conversation,
  active,
  onClick,
}: ConversationItemProps) => {
  const [menuRect, setMenuRect] = useState<DOMRect | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const dotsRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const { removeConversation, renameConversation } = useConversations();
  const router = useRouter();

  const menuOpen = menuRect !== null;

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        dotsRef.current &&
        !dotsRef.current.contains(e.target as Node)
      ) {
        setMenuRect(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    if (renameOpen) {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }
  }, [renameOpen]);

  function handleDotsClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (menuOpen) {
      setMenuRect(null);
    } else {
      setMenuRect(dotsRef.current?.getBoundingClientRect() ?? null);
    }
  }

  async function handleDelete() {
    setMenuRect(null);
    removeConversation(conversation.id);
    if (active) router.push("/chat");
    await deleteConversation(conversation.id);
  }

  function handleRenameOpen() {
    setMenuRect(null);
    setRenameValue(conversation.title);
    setRenameOpen(true);
  }

  async function handleRenameSave() {
    const trimmed = renameValue.trim();
    if (!trimmed || isSaving) return;
    setIsSaving(true);
    const ok = await renameAction(conversation.id, trimmed);
    if (ok) renameConversation(conversation.id, trimmed);
    setIsSaving(false);
    setRenameOpen(false);
  }

  return (
    <div className={classNames(css.item, { [css.active]: active })}>
      <Link
        href={`/chat/${conversation.id}`}
        className={css.link}
        onClick={onClick}
      >
        <span className={css.label}>{conversation.title}</span>
      </Link>

      <button
        ref={dotsRef}
        className={css.dotsBtn}
        type="button"
        aria-label="Conversation options"
        onClick={handleDotsClick}
      >
        <BsThreeDots />
      </button>

      {menuOpen &&
        createPortal(
          <div
            ref={menuRef}
            className={css.menu}
            style={{ top: menuRect!.top, left: menuRect!.right + 6 }}
          >
            <button className={css.menuItem} onClick={handleRenameOpen}>
              <BsPencil className={css.menuIcon} />
              Rename
            </button>
            <button
              className={classNames(css.menuItem, css.danger)}
              onClick={handleDelete}
            >
              <BsTrash className={css.menuIcon} />
              Delete
            </button>
          </div>,
          document.body
        )}

      {renameOpen &&
        createPortal(
          <div className={css.overlay} onClick={() => setRenameOpen(false)}>
            <div
              className={css.renameModal}
              onClick={(e) => e.stopPropagation()}
            >
              <p className={css.renameTitle}>Rename conversation</p>
              <input
                ref={renameInputRef}
                className={css.renameInput}
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameSave();
                  if (e.key === "Escape") setRenameOpen(false);
                }}
                maxLength={60}
              />
              <div className={css.renameFooter}>
                <button
                  className={css.cancelBtn}
                  type="button"
                  onClick={() => setRenameOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className={css.saveBtn}
                  type="button"
                  onClick={handleRenameSave}
                  disabled={isSaving || !renameValue.trim()}
                >
                  {isSaving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
