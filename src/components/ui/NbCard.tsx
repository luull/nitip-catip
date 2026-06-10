import React from "react";

interface NbCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "white" | "pink" | "green" | "pink-light" | "green-light";
  hoverable?: boolean;
}

export default function NbCard({
  children,
  variant = "white",
  hoverable = false,
  className = "",
  ...props
}: NbCardProps) {
  const bgColors = {
    white: "bg-white",
    pink: "bg-pink",
    green: "bg-green",
    "pink-light": "bg-pink-light",
    "green-light": "bg-green-light",
  };

  return (
    <div
      className={`nb-card ${bgColors[variant]} ${
        hoverable ? "nb-card-hover" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
