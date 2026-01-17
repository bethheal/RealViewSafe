import React from "react";

export default function Copyright() {
  const year = new Date().getFullYear();

  return (
    <div className="py-6 text-center text-sm text-white/90">
      © {year} RealView. All rights reserved.
    </div>
  );
}
