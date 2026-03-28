import classNames from "classnames";
import { BsFillPlusCircleFill, BsSearch } from "react-icons/bs";
import { PiChatsCircle } from "react-icons/pi";
import { NavItem } from "../../../common/NavItem/NavItem";
import css from "./Navlist.module.scss";
interface NavListProps {
  collapsed: boolean;
}

export const NavList = ({ collapsed }: NavListProps) => {
  return (
    <div
      className={classNames(css.container, {
        [css.collapsed]: collapsed,
      })}
    >
      <ul className={css.list}>
        <NavItem
          customClassName={css.addItem}
          collapse={collapsed}
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
        />
        <NavItem
          collapse={collapsed}
          icon={<PiChatsCircle className={css.icon} />}
          label="Chats"
        />
      </ul>
    </div>
  );
};
