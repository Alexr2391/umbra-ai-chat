import { useEffect, useRef, useState } from "react";
import { saveMessage } from "@/app/actions";
import { ROLES } from "@/constants";

export type Message = {
  role: "user" | "assistant";
  content: string;
  imageDataUrl?: string; // in-memory only, not persisted
};

interface UseChatOptions {
  conversationId: string | null;
  initialMessages?: Message[];
}

export function useChat(
  messagesEndRef: React.RefObject<HTMLDivElement | null>,
  { conversationId, initialMessages = [] }: UseChatOptions
) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
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

  async function send(text: string, inputAnchor?: HTMLTextAreaElement | null, imageDataUrl?: string, skipUserSave = false) {
    if (!text.trim() || isStreaming) return;

    if (inputAnchor) inputAnchorRef.current = inputAnchor;

    const userSeq = nextSeqRef.current;
    const assistantSeq = userSeq + 1;
    nextSeqRef.current = assistantSeq + 1;

    const history = messages
      .filter((m) => m.content !== "")
      .map(({ role, content }) => ({ role, content }));

    if (conversationId && !skipUserSave) {
      await saveMessage(conversationId, ROLES.USER, text, userSeq);
    }

    setMessages((prev) => [
      ...prev,
      { role: ROLES.USER, content: text, imageDataUrl },
      { role: ROLES.ASSISTANT, content: "" },
    ]);

    let prompt = text;
    if (imageDataUrl) {
      setIsProcessingImage(true);
      try {
        const res = await fetch("/api/vision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageDataUrl }),
        });
        if (res.ok) {
          const { summary } = await res.json();
          prompt = `[Image attached — Analysis: ${summary}]\n\n${text}`;
        }
      } finally {
        setIsProcessingImage(false);
      }
    }

    await streamFromApi(prompt, history, assistantSeq);
    inputAnchorRef.current?.focus();
  }

  useEffect(() => {
    if (autoSentRef.current) return;
    const firstMessage = sessionStorage.getItem("pending_first_message");
    if (!firstMessage) return;
    autoSentRef.current = true;
    sessionStorage.removeItem("pending_first_message");
    const pendingImage = sessionStorage.getItem("pending_image") ?? undefined;
    sessionStorage.removeItem("pending_image");
    send(firstMessage, null, pendingImage);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const lastIsEmpty =
    messages.length > 0 &&
    messages[messages.length - 1].role === ROLES.ASSISTANT &&
    messages[messages.length - 1].content === "";

  return { messages, isStreaming, isProcessingImage, lastIsEmpty, send };
}
