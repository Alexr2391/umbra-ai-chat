import { useEffect, useRef, useState } from "react";
import { saveMessage } from "@/app/actions";
import { ROLES } from "@/constants";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

interface UseChatOptions {
  conversationId: string | null;
  initialMessages?: Message[];
  firstMessage?: string;
}

export function useChat(
  messagesEndRef: React.RefObject<HTMLDivElement | null>,
  { conversationId, initialMessages = [], firstMessage }: UseChatOptions
) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const nextSeqRef = useRef(initialMessages.length);
  const autoSentRef = useRef(false);
  const inputAnchorRef = useRef<HTMLTextAreaElement | null>(null);

  async function streamFromApi(text: string, history: Message[], assistantSeq: number) {
    setIsStreaming(true);
    abortRef.current = new AbortController();
    let fullResponse = "";

    try {
      const res = await fetch("/api/chat-api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, history }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        console.error("Stream failed:", res.status);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value, { stream: true }).split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;

          try {
            const delta = JSON.parse(data).choices[0]?.delta?.content ?? "";
            if (!delta) continue;
            fullResponse += delta;

            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              updated[updated.length - 1] = { ...last, content: last.content + delta };
              return updated;
            });

            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          } catch {
            console.error("error in chunks");
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("Streaming error:", err);
      }
    } finally {
      if (conversationId && fullResponse) {
        await saveMessage(conversationId, ROLES.ASSISTANT, fullResponse, assistantSeq);
      }
      setIsStreaming(false);
    }
  }

  async function send(text: string, inputAnchor?: HTMLTextAreaElement | null, skipUserSave = false) {
    if (!text.trim() || isStreaming) return;

    if (inputAnchor) inputAnchorRef.current = inputAnchor;

    const userSeq = nextSeqRef.current;
    const assistantSeq = userSeq + 1;
    nextSeqRef.current = assistantSeq + 1;

    const history = messages.filter((m) => m.content !== "");

    if (conversationId && !skipUserSave) {
      await saveMessage(conversationId, ROLES.USER, text, userSeq);
    }

    setMessages((prev) => [
      ...prev,
      { role: ROLES.USER, content: text },
      { role: ROLES.ASSISTANT, content: "" },
    ]);

    await streamFromApi(text, history, assistantSeq);
    inputAnchorRef.current?.focus();
  }

  useEffect(() => {
    if (autoSentRef.current || !firstMessage) return;
    autoSentRef.current = true;
    send(firstMessage);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const lastIsEmpty =
    messages.length > 0 &&
    messages[messages.length - 1].role === ROLES.ASSISTANT &&
    messages[messages.length - 1].content === "";

  return { messages, isStreaming, lastIsEmpty, send };
}
