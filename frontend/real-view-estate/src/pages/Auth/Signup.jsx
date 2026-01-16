import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import AuthCard from "../../components/AuthCard";
import GoogleAuth from "../../components/GoogleAuth";
import { User, Mail, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

/* ---------- helpers ---------- */
const isStrongPassword = (password) => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
};

export default function Signup() {
  const [role, setRole] = useState("BUYER");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth(); // optional
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const form = new FormData(e.target);
    const password = form.get("password");
    const confirmPassword = form.get("confirmPassword");

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!isStrongPassword(password)) {
      toast.error(
        "Password must be 8+ characters with uppercase, lowercase, number & symbol"
      );
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/signup", {
        fullName: form.get("fullName"),
        email: form.get("email"),
        password,
        role,
      });

      toast.success("Account created successfully");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Create Your Account">
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

      <form onSubmit={submit} className="space-y-4">
        {/* Full Name */}
        <div className="relative">
          <User className="icon-left" />
          <input
            name="fullName"
            placeholder="Full Name"
            className="input pl-10"
            required
            disabled={loading}
          />
        </div>

        {/* Email */}
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

        {/* Password */}
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

        {/* Confirm Password */}
        <div className="relative">
          <input
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
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

        {/* Submit */}
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
              Creating account...
            </>
          ) : (
            `Sign Up as ${role}`
          )}
        </button>
      </form>

      <div className="my-6">
        <GoogleAuth />
      </div>

      <div className="mt-6 text-center text-sm text-white/80">
        Already have an account?{" "}
        <span
          onClick={() => !loading && navigate("/login")}
          className="text-orange-400 hover:text-orange-300 cursor-pointer font-medium"
        >
          Login
        </span>
      </div>
    </AuthCard>
  );
}
