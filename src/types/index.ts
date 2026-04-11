// --- Domain types shared across server actions and UI ---

export interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface UserPreferences {
  personal_info: string | null;
  agent_tone: string | null;
  memos: string[] | null;
}
