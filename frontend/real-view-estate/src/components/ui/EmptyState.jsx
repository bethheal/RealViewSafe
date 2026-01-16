import React from 'react';

export default function EmptyState({ title="Nothing here", desc="No data found.", action }) {
  return (
    <div className="py-10 text-center">
      <p className="text-base font-bold text-gray-800">{title}</p>
      <p className="text-sm text-gray-500 mt-1">{desc}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
