import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useChat } from "@/app/(ui)/components/Chatboard/useChat";

vi.mock("@/app/actions", () => ({
  saveMessage: vi.fn().mockResolvedValue(undefined),
}));

function makeSseResponse(content: string) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`
        )
      );
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
  return { ok: true, body: stream };
}

describe("useChat", () => {
  const messagesEndRef = { current: null };
  const baseOptions = { conversationId: null };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("initialises with empty state", () => {
    const { result } = renderHook(() => useChat(messagesEndRef, baseOptions));
    expect(result.current.messages).toEqual([]);
    expect(result.current.isStreaming).toBe(false);
  });

  it("initialises with provided messages", () => {
    const initialMessages = [{ role: "user" as const, content: "Hi" }];
    const { result } = renderHook(() =>
      useChat(messagesEndRef, { ...baseOptions, initialMessages })
    );
    expect(result.current.messages).toEqual(initialMessages);
  });

  it("ignores send when text is empty or whitespace", async () => {
    const { result } = renderHook(() => useChat(messagesEndRef, baseOptions));
    await act(async () => {
      await result.current.send("   ");
    });
    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.current.messages).toHaveLength(0);
  });

  it("appends user and assistant messages on send", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(makeSseResponse("Hello!"));
    const { result } = renderHook(() => useChat(messagesEndRef, baseOptions));

    await act(async () => {
      await result.current.send("Hey");
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0]).toEqual({ role: "user", content: "Hey" });
    expect(result.current.messages[1]).toMatchObject({ role: "assistant", content: "Hello!" });
  });

  it("sets isStreaming to false after stream completes", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(makeSseResponse("Done"));
    const { result } = renderHook(() => useChat(messagesEndRef, baseOptions));

    await act(async () => {
      await result.current.send("Hi");
    });

    expect(result.current.isStreaming).toBe(false);
  });

  it("refocuses the input after stream ends", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(makeSseResponse("Response"));
    const { result } = renderHook(() => useChat(messagesEndRef, baseOptions));
    const input = { focus: vi.fn() } as unknown as HTMLTextAreaElement;

    await act(async () => {
      await result.current.send("Hello", input);
    });

    await waitFor(() => expect(input.focus).toHaveBeenCalled());
  });

  it("sends correct payload to the chat API", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(makeSseResponse("OK"));
    const { result } = renderHook(() => useChat(messagesEndRef, baseOptions));

    await act(async () => {
      await result.current.send("Test prompt");
    });

    const [url, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("/api/chat-api");
    const body = JSON.parse(options.body);
    expect(body.prompt).toBe("Test prompt");
    expect(Array.isArray(body.history)).toBe(true);
  });
});
