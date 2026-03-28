import { useRef, useState } from "react";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export function useChat(messagesEndRef: React.RefObject<HTMLDivElement | null>) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function send(text: string) {
    if (!text.trim() || isStreaming) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      { role: "assistant", content: "" },
    ]);
    setIsStreaming(true);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat-api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
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

            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              updated[updated.length - 1] = { ...last, content: last.content + delta };
              return updated;
            });

            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          } catch {
            console.error('error in chunks')
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("Streaming error:", err);
      }
    } finally {
      setIsStreaming(false);
    }
  }

  const lastIsEmpty =
    messages.length > 0 &&
    messages[messages.length - 1].role === "assistant" &&
    messages[messages.length - 1].content === "";

  return { messages, isStreaming, lastIsEmpty, send };
}
