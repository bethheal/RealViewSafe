import React from "react";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const variants = {
    primary: "bg-[#F37A2A] hover:bg-orange-600 text-white shadow-sm",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm",
    outline: "border border-gray-300 hover:bg-gray-50 text-gray-800",
    ghost: "hover:bg-gray-100 text-gray-800",
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-5 py-3 text-base",
  };

  return (
    <button
      {...props}
      className={`rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed
      ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}
