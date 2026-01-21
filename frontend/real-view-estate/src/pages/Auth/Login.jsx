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
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        email,
        password,
        role, // BUYER | AGENT
      });

      // Save token + user in context/localStorage (your AuthContext.login handles this)
      login(res.data);

      const primaryRole = res.data?.user?.primaryRole || role;
      toast.success(`Logged in as ${primaryRole}`);

      setTimeout(() => {
        navigate(primaryRole === "AGENT" ? "/agent/dashboard" : "/buyer/dashboard");
      }, 300);
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;

      // ✅ Friendly message for cross-role attempt
      if (
        status === 403 &&
        typeof msg === "string" &&
        msg.toLowerCase().includes("authorized")
      ) {
        toast.error(
          `This account is not registered as ${role} yet. Please sign up as ${role} to add that role.`
        );
      } else {
        toast.error(msg || "Invalid credentials");
      }
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
            autoComplete="email"
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
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="icon-right"
            disabled={loading}
            aria-label={showPassword ? "Hide password" : "Show password"}
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
