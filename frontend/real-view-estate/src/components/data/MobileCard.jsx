import React from 'react';

export default function MobileList({ rows, renderItem }) {
  return (
    <div className="md:hidden space-y-4">
      {rows.map(renderItem)}
    </div>
  );
}
