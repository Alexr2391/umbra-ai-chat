import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MessageList } from "@/app/(ui)/components/Chatboard/MessageList";

vi.mock("react-markdown", () => ({
  default: ({ children }: { children: string }) => <span>{children}</span>,
}));
vi.mock("remark-gfm", () => ({ default: {} }));

const messagesEndRef = { current: null };

describe("MessageList", () => {
  it("renders user message content", () => {
    render(
      <MessageList
        messages={[{ role: "user", content: "Hello there" }]}
        isStreaming={false}
        lastIsEmpty={false}
        messagesEndRef={messagesEndRef}
      />
    );
    expect(screen.getByText("Hello there")).toBeInTheDocument();
  });

  it("renders assistant messages through markdown", () => {
    render(
      <MessageList
        messages={[{ role: "assistant", content: "**Bold response**" }]}
        isStreaming={false}
        lastIsEmpty={false}
        messagesEndRef={messagesEndRef}
      />
    );
    expect(screen.getByText("**Bold response**")).toBeInTheDocument();
  });

  it("shows thinking indicator when streaming and last message is empty", () => {
    render(
      <MessageList
        messages={[
          { role: "user", content: "Hi" },
          { role: "assistant", content: "" },
        ]}
        isStreaming={true}
        lastIsEmpty={true}
        messagesEndRef={messagesEndRef}
      />
    );
    expect(screen.getByText("Thinking…")).toBeInTheDocument();
  });

  it("hides thinking indicator when not streaming", () => {
    render(
      <MessageList
        messages={[{ role: "assistant", content: "All done" }]}
        isStreaming={false}
        lastIsEmpty={false}
        messagesEndRef={messagesEndRef}
      />
    );
    expect(screen.queryByText("Thinking…")).not.toBeInTheDocument();
  });

  it("hides thinking indicator when streaming but last message has content", () => {
    render(
      <MessageList
        messages={[{ role: "assistant", content: "Partial..." }]}
        isStreaming={true}
        lastIsEmpty={false}
        messagesEndRef={messagesEndRef}
      />
    );
    expect(screen.queryByText("Thinking…")).not.toBeInTheDocument();
  });

  it("renders all messages in order", () => {
    render(
      <MessageList
        messages={[
          { role: "user", content: "Message one" },
          { role: "assistant", content: "Message two" },
        ]}
        isStreaming={false}
        lastIsEmpty={false}
        messagesEndRef={messagesEndRef}
      />
    );
    expect(screen.getByText("Message one")).toBeInTheDocument();
    expect(screen.getByText("Message two")).toBeInTheDocument();
  });
});
