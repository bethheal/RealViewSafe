import React from 'react';

export default function Input({
  label,
  hint,
  error,
  className = "",
  containerClassName = "",
  ...props
}) {
  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-bold text-gray-700">{label}</label>
      )}
      <input
        {...props}
        className={`w-full border border-gray-200 rounded-xl px-4 py-3 outline-none
        focus:ring-2 focus:ring-orange-400 bg-white/90
        ${error ? "border-red-300 focus:ring-red-300" : ""}
        ${className}`}
      />
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}
    </div>
  );
}
