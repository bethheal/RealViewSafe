import React from 'react';
export function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border flex justify-between">
      <div>
        <p className="text-xs text-gray-500 font-bold uppercase">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className="text-gray-300">{icon}</div>
    </div>
  );
}
