import { SYSTEM_PROMPT } from "@/constants";
import { supabase } from "@/lib/supabase";

export async function buildSystemPrompt(
  email: string | null | undefined,
): Promise<string> {
  if (!email) return SYSTEM_PROMPT;

  try {
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (userError) {
      console.error(
        "[buildSystemPrompt] Failed to fetch user for preferences:",
        userError.message,
      );
      return SYSTEM_PROMPT;
    }

    if (!user) return SYSTEM_PROMPT;

    const { data: prefs, error: prefsError } = await supabase
      .from("user_preferences")
      .select("personal_info, agent_tone, memos")
      .eq("user_id", user.id)
      .single();

    if (prefsError && prefsError.code !== "PGRST116") {
      console.error(
        "[buildSystemPrompt] Failed to fetch user preferences:",
        prefsError.message,
      );
    }

    if (!prefs) return SYSTEM_PROMPT;

    const extras: string[] = [];
    if (prefs.personal_info)
      extras.push(`--- User Context ---\n${prefs.personal_info}`);
    if (prefs.agent_tone)
      extras.push(`--- Behavior Customization ---\n${prefs.agent_tone}`);
    const memos = prefs.memos as string[] | null;
    if (memos && memos.length > 0) {
      extras.push(`--- Remember about this user ---\n${memos.join("\n")}`);
    }

    return extras.length > 0
      ? `${SYSTEM_PROMPT}\n\n${extras.join("\n\n")}`
      : SYSTEM_PROMPT;
  } catch (err) {
    console.error("[buildSystemPrompt] Unexpected error:", err);
    return SYSTEM_PROMPT;
  }
}
