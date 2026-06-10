import React from "react";

interface NbBadgeProps {
  children: React.ReactNode;
  variant?: "pink" | "green" | "yellow" | "blue" | "red" | "white" | "gray";
  className?: string;
}

export default function NbBadge({
  children,
  variant = "white",
  className = "",
}: NbBadgeProps) {
  const badgeVariants = {
    pink: "bg-pink text-black",
    green: "bg-green text-black",
    yellow: "bg-amber-300 text-black",
    blue: "bg-cyan-300 text-black",
    red: "bg-rose-500 text-white",
    white: "bg-white text-black",
    gray: "bg-gray-200 text-black",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 border-2 border-black font-black text-xs uppercase tracking-wider ${
        badgeVariants[variant]
      } ${className}`}
    >
      {children}
    </span>
  );
}
