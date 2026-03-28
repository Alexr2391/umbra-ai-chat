import classNames from "classnames";
import type { ReactNode } from "react";
import css from "./NavItem.module.scss";

interface NavItemProps {
  icon: ReactNode;
  label: string;
  collapse?: boolean;
  customClassName?: string;
  onClick?: () => void;
}

export const NavItem = ({
  icon,
  label,
  collapse,
  customClassName,
  onClick,
}: NavItemProps) => {
  return (
    <button
      onClick={onClick}
      className={classNames(css.container, {
        [css.collapsed]: collapse,
        [customClassName || ""]: !!customClassName,
      })}
    >
      <div className={css.flexbox}>
        {icon}
        {!collapse && <div className={css.label}>{label}</div>}
      </div>
    </button>
  );
};
