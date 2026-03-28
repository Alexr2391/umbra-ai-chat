import { BiSolidUser } from "react-icons/bi";
import css from "./Avatar.module.scss";

interface AvatarProps {
  name?: string | null;
}

export const Avatar = ({ name }: AvatarProps) => {
  const firstLetter = name?.charAt(0) ?? null;

  return (
    <div className={css.container}>
      {firstLetter ? (
        <div className={css.label}>{firstLetter}</div>
      ) : (
        <BiSolidUser className={css.icon} />
      )}
    </div>
  );
};
