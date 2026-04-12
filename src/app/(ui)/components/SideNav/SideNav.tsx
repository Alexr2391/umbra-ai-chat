"use client";

import { useConversations } from "@/app/(ui)/context/ConversationsContext";
import { useIsMobile } from "@/app/(ui)/hooks/useIsMobile";
import classNames from "classnames";
import type { DefaultSession } from "next-auth";
import { useReducer, useState } from "react";
import { RxPanelLeft } from "react-icons/rx";
import { AccountSettingsModal } from "../AccountSettingsModal/AccountSettingsModal";
import { PersonalizationModal } from "../PersonalizationModal/PersonalizationModal";
import { SearchModal } from "../SearchModal/SearchModal";
import { NavList } from "./components/NavList/Navlist";
import { UserButton } from "./components/NavList/UserButton/UserButton";
import css from "./SideNav.module.scss";

type SidebarAction = { type: "TOGGLE" } | { type: "OPEN" } | { type: "CLOSE" };

function sidebarReducer(collapsed: boolean, action: SidebarAction): boolean {
  switch (action.type) {
    case "TOGGLE": return !collapsed;
    case "OPEN":   return false;
    case "CLOSE":  return true;
  }
}

interface SideNavProps {
  sessionData: DefaultSession["user"];
}

export const SideNav = ({ sessionData }: SideNavProps) => {
  const { conversations } = useConversations();
  const isMobile = useIsMobile();
  const [collapsed, dispatch] = useReducer(sidebarReducer, false);
  const [openAccSettings, setOpenAccSettings] = useState<boolean>(false);
  const [openPersonalization, setOpenPersonalization] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [footerEl, setFooterEl] = useState<HTMLDivElement | null>(null);

  return (
    <>
      {isMobile && collapsed && (
        <button
          className={css.mobileHamburger}
          aria-label="Open sidebar"
          onClick={() => dispatch({ type: "OPEN" })}
        >
          <RxPanelLeft className={css.expandIcon} />
        </button>
      )}
      {isMobile && !collapsed && (
        <div
          className={css.mobileBackdrop}
          onClick={() => dispatch({ type: "CLOSE" })}
        />
      )}
      <aside
        className={classNames(css.container, {
          [css.collapsed]: collapsed,
        })}
      >
        <div className={css.wrapper}>
          <div className={css.flexbox}>
            <div className={css.logoname}>Umbra</div>
            <button className={css.button} onClick={() => dispatch({ type: "TOGGLE" })}>
              <RxPanelLeft className={css.expandIcon} />
            </button>
          </div>
          <NavList
            collapsed={collapsed}
            conversations={conversations}
            onSearchOpen={() => setOpenSearch(true)}
            onConversationClick={isMobile ? () => dispatch({ type: "CLOSE" }) : undefined}
          />
        </div>
        <div
          ref={setFooterEl}
          className={classNames(css.footer, { [css.collapsed]: collapsed })}
        >
          {openAccSettings && footerEl && (
            <AccountSettingsModal
              onClose={() => setOpenAccSettings(false)}
              userEmail={sessionData?.email}
              anchor={footerEl}
              onPersonalizeClick={() => {
                setOpenAccSettings(false);
                setOpenPersonalization(true);
              }}
            />
          )}
          {openPersonalization && (
            <PersonalizationModal
              onClose={() => setOpenPersonalization(false)}
            />
          )}
          {openSearch && (
            <SearchModal
              conversations={conversations}
              onClose={() => setOpenSearch(false)}
              onSelect={isMobile ? () => dispatch({ type: "CLOSE" }) : undefined}
            />
          )}
          <UserButton
            sessionData={sessionData}
            collapsed={collapsed}
            onClick={() => setOpenAccSettings((prev) => !prev)}
            active={openAccSettings}
          />
        </div>
      </aside>
    </>
  );
};
