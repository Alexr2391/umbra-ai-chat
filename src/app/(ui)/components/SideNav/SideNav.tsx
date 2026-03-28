"use client";

import classNames from "classnames";
import type { DefaultSession } from "next-auth";
import { useState } from "react";
import { RxPanelLeft } from "react-icons/rx";
import { AccountSettingsModal } from "../AccountSettingsModal/AccountSettingsModal";
import { NavList } from "./components/NavList/Navlist";
import { UserButton } from "./components/NavList/UserButton/UserButton";
import css from "./SideNav.module.scss";

interface SideNavProps {
  sessionData: DefaultSession["user"];
}

export const SideNav = ({ sessionData }: SideNavProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [openAccSettings, setOpenAccSettings] = useState<boolean>(false);
  const [footerEl, setFooterEl] = useState<HTMLDivElement | null>(null);

  return (
    <aside
      className={classNames(css.container, {
        [css.collapsed]: collapsed,
      })}
    >
      <div className={css.wrapper}>
        <div className={css.flexbox}>
          <div className={css.logoname}>Umbra</div>
          <button
            className={css.button}
            onClick={() => setCollapsed((state) => !state)}
          >
            <RxPanelLeft className={css.expandIcon} />
          </button>
        </div>
        <NavList collapsed={collapsed} />
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
          />
        )}
        <UserButton
          sessionData={sessionData}
          collapsed={collapsed}
          onClick={() => setOpenAccSettings((prev) => !prev)}
          active={openAccSettings}
        />
        {/* <div>{sessionData?.name}</div>
        <form action={logout}>
          <button type="submit" className={css.logoutButton}>
            Sign out
          </button>
        </form> */}
      </div>
    </aside>
  );
};
