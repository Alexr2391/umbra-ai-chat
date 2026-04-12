"use server";

import { signIn, signOut, auth } from "@/auth";
import { groq } from "@/lib/groq";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { MODEL } from "@/constants";
import { sanitizePreferences } from "@/utils/sanitize";
import type { Conversation, ChatMessage, UserPreferences } from "@/types";
import type { ModelListResponse } from "groq-sdk/resources";

export async function signInWithGoogle(): Promise<void> {
  await signIn("google", { redirectTo: "/chat" });
}

export async function logout(): Promise<void> {
  await signOut({ redirectTo: "/" });
}

export const getModels = async (): Promise<ModelListResponse> => {
  return await groq.models.list();
};

export const createConversation = async (firstMessage: string): Promise<string | null> => {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      console.error("[createConversation] No authenticated session");
      return null;
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (userError || !user) {
      console.error("[createConversation] User not found:", userError?.message);
      return null;
    }

    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        model: MODEL,
        title: firstMessage.slice(0, 60),
      })
      .select("id")
      .single();

    if (convError || !conversation) {
      console.error("[createConversation] Failed to insert conversation:", convError?.message);
      return null;
    }

    revalidatePath("/chat", "layout");
    return conversation.id;
  } catch (err) {
    console.error("[createConversation] Unexpected error:", err);
    return null;
  }
};

export const getConversations = async (): Promise<Conversation[]> => {
  const session = await auth();
  if (!session?.user?.email) return [];

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (!user) return [];

  const { data } = await supabase
    .from("conversations")
    .select("id, title, updated_at")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("updated_at", { ascending: false });

  return data ?? [];
};

export const saveMessage = async (
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  sequence: number
): Promise<void> => {
  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    role,
    content: { text: content },
    token_estimate: Math.ceil(content.length / 4),
    sequence,
  });

  if (error) {
    console.error("[saveMessage] Failed to save message:", error.message);
  }
};

export const getConversation = async (conversationId: string): Promise<{ id: string } | null> => {
  const session = await auth();
  if (!session?.user?.email) return null;

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (!user) return null;

  const { data } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", conversationId)
    .eq("user_id", user.id)
    .single();

  return data ?? null;
};

export const getUserPreferences = async (): Promise<UserPreferences | null> => {
  const session = await auth();
  if (!session?.user?.email) return null;

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (!user) return null;

  const { data } = await supabase
    .from("user_preferences")
    .select("personal_info, agent_tone, memos")
    .eq("user_id", user.id)
    .single();

  return data ?? { personal_info: "", agent_tone: "", memos: [] as string[] };
};

export const saveUserPreferences = async ({
  personalInfo,
  agentTone,
  memos,
}: {
  personalInfo: string;
  agentTone: string;
  memos: string[];
}): Promise<boolean> => {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      console.error("[saveUserPreferences] No authenticated session");
      return false;
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (userError || !user) {
      console.error("[saveUserPreferences] User not found:", userError?.message);
      return false;
    }

    const sanitized = sanitizePreferences({ personalInfo, agentTone, memos });

    const { error: upsertError } = await supabase
      .from("user_preferences")
      .upsert(
        {
          user_id: user.id,
          personal_info: sanitized.personalInfo,
          agent_tone: sanitized.agentTone,
          memos: sanitized.memos,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      console.error("[saveUserPreferences] Upsert failed:", upsertError.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[saveUserPreferences] Unexpected error:", err);
    return false;
  }
};

export const deleteConversation = async (id: string): Promise<boolean> => {
  try {
    const session = await auth();
    if (!session?.user?.email) return false;

    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (!user) return false;

    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("[deleteConversation] Failed:", error.message);
      return false;
    }

    revalidatePath("/chat", "layout");
    return true;
  } catch (err) {
    console.error("[deleteConversation] Unexpected error:", err);
    return false;
  }
};

export const renameConversation = async (id: string, title: string): Promise<boolean> => {
  try {
    const session = await auth();
    if (!session?.user?.email) return false;

    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (!user) return false;

    const { error } = await supabase
      .from("conversations")
      .update({ title: title.trim().slice(0, 60) })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("[renameConversation] Failed:", error.message);
      return false;
    }

    revalidatePath("/chat", "layout");
    return true;
  } catch (err) {
    console.error("[renameConversation] Unexpected error:", err);
    return false;
  }
};

export const getConversationMessages = async (conversationId: string): Promise<ChatMessage[]> => {
  const { data } = await supabase
    .from("messages")
    .select("role, content, sequence")
    .eq("conversation_id", conversationId)
    .order("sequence", { ascending: true });

  return (data ?? []).map((m) => ({
    role: m.role as "user" | "assistant",
    content: (m.content as { text: string }).text,
  }));
};
