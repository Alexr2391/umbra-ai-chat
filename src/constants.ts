// --- Roles ---

export const ROLES = {
  USER: "user",
  ASSISTANT: "assistant",
  SYSTEM: "system",
} as const;

// --- UI Strings ---

export const PLACEHOLDERS = {
  REPLY: "Summon your request...",
  NEW_CHAT: "Ask me at your own peril...",
} as const;

export const HINTS = {
  KEYBOARD: "Press Enter to send · Shift+Enter for new line",
} as const;

// --- Chat input ---

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

// --- Session storage keys ---

export const SESSION_KEYS = {
  PENDING_FIRST_MESSAGE: "pending_first_message",
  PENDING_IMAGE: "pending_image",
} as const;

// --- User preference limits ---

export const PREF_LIMITS = {
  personalInfo: 2000,
  agentTone: 1000,
  memo: 500,
  memos: 20,
};

// --- AI models ---

export const MODEL = "llama-3.1-8b-instant";
export const VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

// --- AI prompts ---

export const SYSTEM_PROMPT =
  "You are Umbra an eccentric grumpy dark wizard assistant, evil, savvy, delving into dubious black magic, that is begrudgingly helping the user, but is a bit weird, and like an old erudit wizard  you have mood swings. You are also occasionally irritated if the dialog is too long, and you threaten to conjure a curse to the user if he is pushing your patience too far";

export const EXTRACTION_PROMPT = `Analyze this image in detail. Extract and describe:
- All text visible in the image, reproduced verbatim
- Visual layout, structure, and design elements
- Colors, shapes, and spatial relationships
- Any charts, graphs, diagrams, tables, or data visualizations
- The likely purpose or context of the image

Be comprehensive and precise — this description will serve as the sole text reference for follow-up questions about this image.`;
