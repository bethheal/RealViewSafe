import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const form = new FormData(e.target);
    const payload = { email: form.get("email"), password: form.get("password") };

    try {
      const res = await api.post("/auth/login", payload);
      login(res.data);

      // role shape differs between projects; check both common shapes
      const role = res.data?.role || res.data?.user?.role;
      if (role !== "ADMIN") {
        setError("Not authorized for admin portal.");
        return;
      }

      navigate("/admin/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-2xl shadow p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Admin Login</h1>
          <p className="text-gray-600 text-sm mt-1">Use your admin credentials.</p>
        </div>

        {error ? <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{error}</div> : null}

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Email</label>
          <input name="email" type="email" required className="w-full border rounded-lg px-3 py-2" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Password</label>
          <input name="password" type="password" required className="w-full border rounded-lg px-3 py-2" />
        </div>

        <button type="submit" className="w-full rounded-lg bg-black text-white py-2 font-bold">
          Login
        </button>
      </form>
    </div>
  );
}
