import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatInput } from "@/app/(ui)/components/common/ChatInput/ChatInput";

const defaultProps = {
  value: "",
  onChange: vi.fn(),
  onSend: vi.fn(),
  placeholder: "Type a message",
  isActive: false,
};

describe("ChatInput", () => {
  it("renders textarea with placeholder", () => {
    render(<ChatInput {...defaultProps} />);
    expect(screen.getByPlaceholderText("Type a message")).toBeInTheDocument();
  });

  it("disables send button when isActive is false", () => {
    render(<ChatInput {...defaultProps} isActive={false} />);
    expect(screen.getByRole("button", { name: /send message/i })).toBeDisabled();
  });

  it("enables send button when isActive is true", () => {
    render(<ChatInput {...defaultProps} isActive={true} />);
    expect(screen.getByRole("button", { name: /send message/i })).not.toBeDisabled();
  });

  it("calls onSend on Enter keypress", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatInput {...defaultProps} onSend={onSend} value="hello" isActive={true} />);
    await user.type(screen.getByRole("textbox"), "{Enter}");
    expect(onSend).toHaveBeenCalledOnce();
  });

  it("does not call onSend on Shift+Enter", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatInput {...defaultProps} onSend={onSend} value="hello" isActive={true} />);
    await user.keyboard("{Shift>}{Enter}{/Shift}");
    expect(onSend).not.toHaveBeenCalled();
  });

  it("calls onSend when send button is clicked", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatInput {...defaultProps} onSend={onSend} isActive={true} />);
    await user.click(screen.getByRole("button", { name: /send message/i }));
    expect(onSend).toHaveBeenCalledOnce();
  });

  it("disables textarea when disabled prop is true", () => {
    render(<ChatInput {...defaultProps} disabled={true} />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });
});
