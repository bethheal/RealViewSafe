import React from "react";

export default function Badge({ children, tone = "gray" }) {
  const tones = {
    gray: "bg-gray-100 text-gray-700",
    orange: "bg-orange-100 text-[#F37A2A]",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
    purple: "bg-purple-100 text-purple-700",
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold ${tones[tone]}`}>
      {children}
    </span>
  );
}
