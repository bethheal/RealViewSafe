import React from "react"
export default function AuthCard({ title, children }) {
  return (
    <div className="auth-bg min-h-screen flex items-center justify-center">
      <div className="glass w-[420px] p-8 shadow-xl">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
