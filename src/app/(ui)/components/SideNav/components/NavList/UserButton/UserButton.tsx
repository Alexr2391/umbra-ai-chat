import { Avatar } from "@/app/(ui)/components/common/Avatar/Avatar";
import classNames from "classnames";
import type { DefaultSession } from "next-auth";
import { RiExpandVerticalLine } from "react-icons/ri";
import css from "./UserButton.module.scss";

interface UserButtonProps {
  sessionData: DefaultSession["user"];
  collapsed: boolean;
  onClick: () => void;
  active: boolean;
}

export const UserButton = ({
  sessionData,
  collapsed,
  active,
  onClick,
}: UserButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={classNames(css.userButton, {
        [css.collapsed]: collapsed,
        [css.active]: active,
      })}
    >
      <div className={css.flexbox}>
        <div className={css.userContainer}>
          <Avatar name={sessionData?.name} />
          <div className={css.userInfo}>
            <div className={css.userName}>{sessionData?.name}</div>
            <div className={css.userPlan}>Free Plan</div>
          </div>
        </div>
        <RiExpandVerticalLine className={css.icon} />
      </div>
    </button>
  );
};
