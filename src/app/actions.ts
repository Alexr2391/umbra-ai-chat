"use server";

import { signIn, signOut, auth } from "@/auth";
import { groq } from "@/lib/groq";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/chat" });
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}

export const getModels = async () => {
  return await groq.models.list();
};

export const createConversation = async (firstMessage: string): Promise<string> => {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Not authenticated");

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (!user) throw new Error("User not found");

  const { data: conversation } = await supabase
    .from("conversations")
    .insert({
      user_id: user.id,
      model: "llama-3.1-8b-instant",
      title: firstMessage.slice(0, 60),
    })
    .select("id")
    .single();

  if (!conversation) throw new Error("Failed to create conversation");

  revalidatePath("/chat", "layout");
  return conversation.id;
};

export const getConversations = async () => {
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
) => {
  await supabase.from("messages").insert({
    conversation_id: conversationId,
    role,
    content: { text: content },
    token_estimate: Math.ceil(content.length / 4),
    sequence,
  });
};

export const getConversation = async (conversationId: string) => {
  const { data } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", conversationId)
    .single();

  return data ?? null;
};

export const getUserPreferences = async () => {
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
}) => {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Not authenticated");

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (!user) throw new Error("User not found");

  await supabase
    .from("user_preferences")
    .upsert(
      {
        user_id: user.id,
        personal_info: personalInfo,
        agent_tone: agentTone,
        memos,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
};

export const getConversationMessages = async (conversationId: string) => {
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
