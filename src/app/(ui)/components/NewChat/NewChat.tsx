"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createConversation } from "@/app/actions";
import { ChatInput } from "@/app/(ui)/components/common/ChatInput/ChatInput";
import { PLACEHOLDERS } from "@/app/(ui)/components/Chatboard/constants";
import css from "./NewChat.module.scss";

const PENDING_IMAGE_KEY = "pending_image";

interface NewChatProps {
  userName: string | null | undefined;
}

export const NewChat = ({ userName }: NewChatProps) => {
  const [value, setValue] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSend() {
    const text = value.trim();
    if (!text || isLoading) return;
    setIsLoading(true);
    sessionStorage.setItem("pending_first_message", text);
    if (image) {
      sessionStorage.setItem(PENDING_IMAGE_KEY, image);
    }

    const conversationId = await createConversation(text);

    if (!conversationId) {
      sessionStorage.removeItem("pending_first_message");
      sessionStorage.removeItem(PENDING_IMAGE_KEY);
      setIsLoading(false);
      return;
    }

    router.push(`/chat/${conversationId}`);
  }

  const firstName = userName?.split(" ")[0] ?? "there";

  return (
    <div className={css.container}>
      <h1 className={css.greeting}>Hello, {firstName}</h1>
      <p className={css.subtitle}>What do you want? Speak quickly... I have hexes to brew.</p>
      <ChatInput
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onSend={handleSend}
        placeholder={PLACEHOLDERS.NEW_CHAT}
        isActive={(value.trim().length > 0 || !!image) && !isLoading}
        disabled={isLoading}
        image={image}
        onImageAttach={setImage}
        onImageRemove={() => setImage(null)}
      />
    </div>
  );
};
