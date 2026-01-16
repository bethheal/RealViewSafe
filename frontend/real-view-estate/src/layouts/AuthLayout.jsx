import React from "react"
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen auth-bg flex items-center justify-center relative">
      
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/50 z-0" />

      {/* Routed auth page */}
      <div className="relative z-10 w-full max-w-md px-4">
        <Outlet />
      </div>

    </div>
  );
}
