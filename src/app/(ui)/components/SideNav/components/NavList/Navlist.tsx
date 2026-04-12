"use client";

import classNames from "classnames";
import { usePathname } from "next/navigation";
import { BsFillPlusCircleFill, BsSearch } from "react-icons/bs";
import { PiChatsCircle } from "react-icons/pi";
import type { Conversation } from "@/types";
import { ConversationItem } from "./ConversationItem/ConversationItem";
import { NavItem } from "../../../common/NavItem/NavItem";
import css from "./Navlist.module.scss";

interface NavListProps {
  collapsed: boolean;
  conversations: Conversation[];
  onSearchOpen: () => void;
  onConversationClick?: () => void;
}

export const NavList = ({ collapsed, conversations, onSearchOpen, onConversationClick }: NavListProps) => {
  const pathname = usePathname();

  return (
    <div className={classNames(css.container, { [css.collapsed]: collapsed })}>
      <ul className={css.list}>
        <NavItem
          customClassName={css.addItem}
          collapse={collapsed}
          href="/chat"
          icon={
            <span className={css.addButton}>
              <BsFillPlusCircleFill className={css.addIcon} />
            </span>
          }
          label="New chat"
        />
        <NavItem
          collapse={collapsed}
          icon={<BsSearch className={css.icon} />}
          label="Search"
          onClick={onSearchOpen}
        />
        <NavItem
          collapse={collapsed}
          icon={<PiChatsCircle className={css.icon} />}
          label="Chats"
        />
      </ul>

      {!collapsed && conversations.length > 0 && (
        <div className={css.conversationSection}>
          <p className={css.sectionLabel}>Recent</p>
          <ul className={css.conversationList}>
            {conversations.map((c) => (
              <ConversationItem
                key={c.id}
                conversation={c}
                active={pathname === `/chat/${c.id}`}
                onClick={onConversationClick}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
