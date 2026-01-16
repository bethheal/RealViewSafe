import React from 'react'
export default function FeatureCard({
  icon,
  title,
  description,
  highlight = false,
}) {
  return (
    <div
      className={`
        group rounded-2xl p-8 text-center transition-all duration-300
        bg-white text-gray-800
        hover:bg-[#8B6F2F] hover:text-white hover:shadow-xl
        ${highlight ? "bg-[#8B6F2F] text-white shadow-xl" : ""}
      `}
    >
      <div
        className={`
          mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl
          bg-orange-100 text-orange-500
          group-hover:bg-white/20 group-hover:text-white
          ${highlight ? "bg-white/20 text-white" : ""}
        `}
      >
        {icon}
      </div>

      <h3 className="mb-3 text-lg font-semibold">
        {title}
      </h3>

      <p
        className={`
          text-sm leading-relaxed
          text-gray-600
          group-hover:text-white/80
          ${highlight ? "text-white/80" : ""}
        `}
      >
        {description}
      </p>
    </div>
  );
}
