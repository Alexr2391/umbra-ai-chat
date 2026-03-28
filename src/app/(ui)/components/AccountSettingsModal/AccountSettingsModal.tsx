import { logout } from "@/app/actions";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { NavItem } from "../common/NavItem/NavItem";
import css from "./AccountSetttingsModal.module.scss";

interface AccountSettingsModalProps {
  anchor: HTMLDivElement;
  userEmail: string | null | undefined;
  onClose: () => void;
}

export const AccountSettingsModal = ({
  anchor,
  userEmail,
  onClose,
}: AccountSettingsModalProps) => {
  const rect = anchor.getBoundingClientRect();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        !anchor.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, anchor]);

  return createPortal(
    <div
      ref={containerRef}
      className={css.container}
      style={{
        bottom: window.innerHeight - rect.top + 8,
        left: rect.left + 8,
      }}
    >
      <div className={css.userEmail}>{userEmail}</div>
      <li className={css.list}>
        <NavItem
          icon={<RiLogoutBoxRLine />}
          label={"Log out"}
          onClick={logout}
        />
      </li>
    </div>,
    document.body,
  );
};
