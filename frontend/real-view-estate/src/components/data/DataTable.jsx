import React from 'react';

export default function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white/80 backdrop-blur-md border border-white/40 shadow-sm rounded-2xl p-5 flex items-center justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-wider font-extrabold text-gray-500">{title}</p>
        <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
      </div>
      <div className="text-gray-300">{icon}</div>
    </div>
  );
}
