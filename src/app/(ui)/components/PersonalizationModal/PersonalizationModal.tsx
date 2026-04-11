"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getUserPreferences, saveUserPreferences } from "@/app/actions";
import { BsPlus, BsX } from "react-icons/bs";
import css from "./PersonalizationModal.module.scss";

interface PersonalizationModalProps {
  onClose: () => void;
}

export const PersonalizationModal = ({ onClose }: PersonalizationModalProps) => {
  const [personalInfo, setPersonalInfo] = useState("");
  const [agentTone, setAgentTone] = useState("");
  const [memos, setMemos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getUserPreferences().then((prefs) => {
      if (prefs) {
        setPersonalInfo(prefs.personal_info ?? "");
        setAgentTone(prefs.agent_tone ?? "");
        setMemos((prefs.memos as string[]) ?? []);
      }
      setIsLoading(false);
    });
  }, []);

  async function handleSave() {
    setIsSaving(true);
    const ok = await saveUserPreferences({ personalInfo, agentTone, memos });
    setIsSaving(false);
    if (ok) onClose();
  }

  function addMemo() {
    setMemos((prev) => [...prev, ""]);
  }

  function updateMemo(index: number, value: string) {
    setMemos((prev) => prev.map((m, i) => (i === index ? value : m)));
  }

  function removeMemo(index: number) {
    setMemos((prev) => prev.filter((_, i) => i !== index));
  }

  return createPortal(
    <div className={css.overlay} onClick={onClose}>
      <div className={css.modal} onClick={(e) => e.stopPropagation()}>
        <div className={css.header}>
          <h2 className={css.title}>Personalize Umbra</h2>
          <button className={css.closeBtn} type="button" aria-label="Close" onClick={onClose}>
            <BsX />
          </button>
        </div>

        {isLoading ? (
          <div className={css.loading}>Loading…</div>
        ) : (
          <>
            <div className={css.body}>
              <div className={css.section}>
                <label className={css.label}>About You</label>
                <p className={css.hint}>
                  Share context about yourself — Umbra will use this to tailor responses.
                </p>
                <textarea
                  className={css.textarea}
                  value={personalInfo}
                  onChange={(e) => setPersonalInfo(e.target.value)}
                  placeholder="e.g. I'm a software engineer who works with Python and React..."
                  rows={3}
                  maxLength={2000}
                />
              </div>

              <div className={css.section}>
                <label className={css.label}>Agent Tone</label>
                <p className={css.hint}>Customize how Umbra behaves or speaks.</p>
                <textarea
                  className={css.textarea}
                  value={agentTone}
                  onChange={(e) => setAgentTone(e.target.value)}
                  placeholder="e.g. Be more concise. Prefer code examples over explanations..."
                  rows={3}
                  maxLength={1000}
                />
              </div>

              <div className={css.section}>
                <label className={css.label}>Memos</label>
                <p className={css.hint}>Facts Umbra will remember across every conversation.</p>
                <div className={css.memoList}>
                  {memos.map((memo, i) => (
                    <div key={i} className={css.memoRow}>
                      <input
                        className={css.memoInput}
                        value={memo}
                        onChange={(e) => updateMemo(i, e.target.value)}
                        placeholder="e.g. My timezone is UTC+2"
                        maxLength={500}
                      />
                      <button
                        className={css.removeMemoBtn}
                        type="button"
                        aria-label="Remove memo"
                        onClick={() => removeMemo(i)}
                      >
                        <BsX />
                      </button>
                    </div>
                  ))}
                  <button
                    className={css.addMemoBtn}
                    type="button"
                    onClick={addMemo}
                    disabled={memos.some((m) => m.trim() === "")}
                  >
                    <BsPlus />
                    Add memo
                  </button>
                </div>
              </div>
            </div>

            <div className={css.footer}>
              <button className={css.cancelBtn} type="button" onClick={onClose}>
                Cancel
              </button>
              <button
                className={css.saveBtn}
                type="button"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving…" : "Save"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};
