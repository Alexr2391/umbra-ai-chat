"use client";

import { createContext, useContext, useState } from "react";
import type { Conversation } from "@/types";

export type { Conversation };

interface ConversationsContextValue {
  conversations: Conversation[];
  addConversation: (conv: Conversation) => void;
  replaceConversation: (tempId: string, real: Conversation) => void;
  removeConversation: (id: string) => void;
}

const ConversationsContext = createContext<ConversationsContextValue | null>(null);

export function ConversationsProvider({
  children,
  initialConversations,
}: {
  children: React.ReactNode;
  initialConversations: Conversation[];
}) {
  const [conversations, setConversations] = useState(initialConversations);

  function addConversation(conv: Conversation) {
    setConversations((prev) => [conv, ...prev]);
  }

  function replaceConversation(tempId: string, real: Conversation) {
    setConversations((prev) => prev.map((c) => (c.id === tempId ? real : c)));
  }

  function removeConversation(id: string) {
    setConversations((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <ConversationsContext.Provider
      value={{ conversations, addConversation, replaceConversation, removeConversation }}
    >
      {children}
    </ConversationsContext.Provider>
  );
}

export function useConversations() {
  const ctx = useContext(ConversationsContext);
  if (!ctx) throw new Error("useConversations must be used within ConversationsProvider");
  return ctx;
}
