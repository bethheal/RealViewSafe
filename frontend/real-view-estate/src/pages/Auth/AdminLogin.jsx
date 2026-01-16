import React from 'react';

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Button from "../../components/ui/Button";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // call your login(email, password, "admin")
      alert("Logged in (wire to auth)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff8ec] to-[#ffe3c2] px-4">
      <div className="w-full max-w-md bg-white/70 backdrop-blur-md border border-white/40 shadow-2xl rounded-2xl p-8">
        <h2 className="text-3xl font-extrabold text-center text-[#F37A2A]">Admin Login</h2>
        <p className="text-center text-sm text-gray-600 mt-2">Sign in to manage approvals and subscriptions.</p>

        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <input
            type="email"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <input
              type={show ? "text" : "password"}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-3.5 text-gray-500 hover:text-[#F37A2A]"
            >
              {show ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <Button className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Log in as Admin"}
          </Button>

          <button
            type="button"
            className="w-full text-sm text-gray-600 hover:text-[#F37A2A] font-bold mt-2"
            onClick={() => alert("Show support message")}
          >
            Forgot password? Contact support
          </button>
        </form>
      </div>
    </div>
  );
}
