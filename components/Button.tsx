"use client";

import clsx from "clsx";

type Props = {
  type?: "button" | "submit" | undefined;
  fullWidth?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
  secondary?: boolean;
  danger?: boolean;
  disabled?: boolean;
  className?: string;
};

function Button({
  type,
  fullWidth,
  children,
  onClick,
  secondary,
  danger,
  disabled,
  className,
}: Props) {
  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={clsx(
        `flex justify-center rounded-md px-3 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${className}`,
        disabled && "opacity-50 cursor-default",
        fullWidth && "w-full",
        secondary
          ? "text-gray-900 dark:text-gray-100"
          : "text-white dark:text-black",
        danger &&
          "bg-rose-500 hover:bg-rose-600 focus-visible:outline-rose-600",
        !secondary &&
          !danger &&
          "bg-sky-500 hover:bg-sky-600 focus-visible:outline-sky-600"
      )}
    >
      {children}
    </button>
  );
}

export default Button;
