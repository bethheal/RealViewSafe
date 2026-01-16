import React from 'react';

export default function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white/80 border border-white/40 rounded-2xl p-5 shadow-sm">
      <Skeleton className="h-5 w-40 mb-4" />
      <Skeleton className="h-10 w-full mb-3" />
      <Skeleton className="h-10 w-full mb-3" />
      <Skeleton className="h-10 w-2/3" />
    </div>
  );
}
