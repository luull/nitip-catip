import React from "react";

interface NbButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "pink" | "green" | "white";
  fullWidth?: boolean;
}

export default function NbButton({
  children,
  variant = "pink",
  fullWidth = false,
  className = "",
  type = "button",
  ...props
}: NbButtonProps) {
  const btnVariants = {
    pink: "nb-btn-pink",
    green: "nb-btn-green",
    white: "nb-btn-white",
  };

  return (
    <button
      type={type}
      className={`nb-btn px-6 py-3 text-sm md:text-base ${
        btnVariants[variant]
      } ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
