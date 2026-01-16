import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import AuthCard from "../../components/AuthCard";
import GoogleAuth from "../../components/GoogleAuth";
import { Mail, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState("BUYER");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const form = new FormData(e.target);

    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        email: form.get("email"),
        password: form.get("password"),
        role,
      });

      // Save user + token in context
      login(res.data);

      // Toast success
      toast.success(`Logged in as ${res.data.user.primaryRole}`);

      // Redirect based on server-verified role
      const userRole = res.data.user.primaryRole;
      setTimeout(() => {
        navigate(userRole === "AGENT" ? "/agent/dashboard" : "/buyer/dashboard");
      }, 500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Welcome Back">
      {/* Role Switch */}
      <div className="flex justify-center gap-2 mb-6 bg-white/20 p-1 rounded-full">
        {["BUYER", "AGENT"].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            disabled={loading}
            className={`role-btn ${
              role === r
                ? "bg-orange-500 text-white"
                : "text-white/80 hover:text-white"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Login Form */}
      <form onSubmit={submit} className="space-y-4">
        <div className="relative">
          <Mail className="icon-left" />
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="input pl-10"
            required
            disabled={loading}
          />
        </div>

        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="input pl-10 pr-10"
            required
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="icon-right"
            disabled={loading}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`btn-primary w-full flex items-center justify-center gap-2 ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Logging in...
            </>
          ) : (
            `Login as ${role}`
          )}
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => navigate("/forgot-password")}
          className="block w-full text-center text-sm text-white/80 hover:underline disabled:opacity-50"
        >
          Forgot password?
        </button>
      </form>

      <div className="my-6">
        <GoogleAuth />
      </div>

      <div className="mt-6 text-center text-sm text-white/80">
        Don’t have an account?{" "}
        <span
          onClick={() => !loading && navigate("/signup")}
          className="text-orange-400 hover:text-orange-300 cursor-pointer font-medium"
        >
          Sign up
        </span>
      </div>
    </AuthCard>
  );
}
