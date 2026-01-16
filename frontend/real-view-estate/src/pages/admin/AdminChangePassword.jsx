import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../../lib/api"; // ✅ same api you used in AdminLogin
import { useAuth } from "../../context/AuthContext";

export default function AdminChangePassword() {
  const navigate = useNavigate();
  const { auth, login } = useAuth(); // if your context exposes auth + login

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const form = new FormData(e.target);
    const currentPassword = form.get("currentPassword");
    const newPassword = form.get("newPassword");
    const confirmPassword = form.get("confirmPassword");

    if (!currentPassword || !newPassword) {
      setError("Please fill all fields.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    try {
      setLoading(true);

      // ✅ Calls your backend: POST /auth/change-password
      await api.post("/auth/change-password", { currentPassword, newPassword });

      setSuccess("Password changed successfully.");

      // ✅ Optional: update local auth state so mustChangePassword becomes false in UI
      // This depends on your AuthContext structure. If you store user data,
      // update it so future redirects don't send you back here.
      if (auth?.user) {
        login({
          ...auth,
          user: { ...auth.user, mustChangePassword: false },
        });
      }

      navigate("/admin/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-extrabold text-gray-900">Change Password</h1>
      <p className="text-gray-600 mt-1">
        Please change your password to continue.
      </p>

      {error ? (
        <div className="mt-4 bg-red-50 text-red-700 text-sm p-3 rounded-lg">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mt-4 bg-green-50 text-green-700 text-sm p-3 rounded-lg">
          {success}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* Current / Temp Password */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Current / Temporary Password
          </label>
          <div className="relative">
            <input
              name="currentPassword"
              type={showCurrent ? "text" : "password"}
              required
              className="w-full border rounded-lg px-3 py-2 pr-10"
              placeholder="Enter temporary password"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
              aria-label={showCurrent ? "Hide password" : "Show password"}
            >
              {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            New Password
          </label>
          <div className="relative">
            <input
              name="newPassword"
              type={showNew ? "text" : "password"}
              required
              className="w-full border rounded-lg px-3 py-2 pr-10"
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
              aria-label={showNew ? "Hide password" : "Show password"}
            >
              {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <p className="text-xs text-gray-500">Minimum 8 characters.</p>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Confirm New Password
          </label>
          <input
            name="confirmPassword"
            type="password"
            required
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Confirm new password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-black text-white py-2 font-bold disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
