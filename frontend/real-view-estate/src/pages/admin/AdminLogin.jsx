import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";


export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");

    const form = new FormData(e.target);
    const payload = {
      email: form.get("email"),
      password: form.get("password"),
    };

    try {
      setLoading(true);
      const res = await api.post("/auth/login", payload);
      login(res.data);

      const isAdmin =
        res.data?.user?.primaryRole === "ADMIN" ||
        res.data?.user?.roles?.includes("ADMIN");

      if (!isAdmin) {
        setError("Not authorized for admin portal.");
        return;
      }

      // force change password if needed
      if (res.data?.user?.mustChangePassword) {
        navigate("/admin/change-password");
      } else {
        navigate("/admin/dashboard");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow p-6 space-y-4"
      >
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Admin Login</h1>
          <p className="text-gray-600 text-sm mt-1">Use your admin credentials.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Email</label>
          <input
            name="email"
            type="email"
            required
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Password</label>

          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              className="w-full border rounded-lg px-3 py-2 pr-10"
            />

            {/* eye toggle */}
           <button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
>
  {showPassword ? (
    <EyeOff size={20} />
  ) : (
    <Eye size={20} />
  )}
</button>

          </div>
        </div>

        <button
          type="submit"
          disabled={loading }
          className={`w-full rounded-lg bg-black text-white py-2 font-bold ${
          loading ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-800"}`}
        >
          {loading ? (
            <>
            Logging in...
            </>):(

            "Login"
            )}
        </button>
      </form>
    </div>
  );
}
