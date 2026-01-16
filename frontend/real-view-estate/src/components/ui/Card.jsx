import React from 'react';

export default function Card({ title, subtitle, right, children, className = "" }) {
  return (
    <div className={`bg-white/80 backdrop-blur-md border border-white/40 shadow-sm rounded-2xl ${className}`}>
      {(title || right) && (
        <div className="p-5 border-b border-gray-100 flex items-start justify-between gap-4">
          <div>
            {title && <h3 className="text-lg font-extrabold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {right}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
