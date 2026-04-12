"use client";

import classNames from "classnames";
import Link from "next/link";
import type { ReactNode } from "react";
import css from "./NavItem.module.scss";

interface NavItemProps {
  icon?: ReactNode;
  label: string;
  collapse?: boolean;
  customClassName?: string;
  onClick?: () => void;
  href?: string;
  active?: boolean;
}

export const NavItem = ({
  icon,
  label,
  collapse,
  customClassName,
  onClick,
  href,
  active,
}: NavItemProps) => {
  const classes = classNames(css.container, {
    [css.collapsed]: collapse,
    [css.active]: active,
    [customClassName || ""]: !!customClassName,
  });

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        <div className={css.flexbox}>
          {icon && icon}
          {!collapse && <div className={css.label}>{label}</div>}
        </div>
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes}>
      <div className={css.flexbox}>
        {icon && icon}
        {!collapse && <div className={css.label}>{label}</div>}
      </div>
    </button>
  );
};
