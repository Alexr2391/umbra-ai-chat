import { PREF_LIMITS } from "@/constants";

export function sanitizePref(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength).replace(/---/g, "\u2014");
}

export function sanitizePreferences(raw: {
  personalInfo: string;
  agentTone: string;
  memos: string[];
}) {
  return {
    personalInfo: sanitizePref(raw.personalInfo, PREF_LIMITS.personalInfo),
    agentTone: sanitizePref(raw.agentTone, PREF_LIMITS.agentTone),
    memos: raw.memos
      .slice(0, PREF_LIMITS.memos)
      .map((m) => sanitizePref(m, PREF_LIMITS.memo)),
  };
}
