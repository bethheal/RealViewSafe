import React, { useState } from "react";
import api from "../../lib/api";
import AuthCard from "../../components/AuthCard";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const email = new FormData(e.target).get("email");

    try {
      setLoading(true);

      await api.post("/auth/forgot-password", { email });

      toast.success("Password reset link sent ");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Reset Password">
      <form onSubmit={submit} className="space-y-4">
        <input
          name="email"
          type="email"
          placeholder="Your email"
          className="input"
          required
          disabled={loading}
        />

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
              Sending link...
            </>
          ) : (
            "Send Reset Link"
          )}
        </button>
      </form>
    </AuthCard>
  );
}
