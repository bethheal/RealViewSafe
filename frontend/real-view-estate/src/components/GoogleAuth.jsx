import React from "react"
import { GoogleLogin } from "@react-oauth/google";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function GoogleAuth() {
  const { login } = useAuth();

  return (
    <div className="mt-6">
      <GoogleLogin
        onSuccess={async ({ credential }) => {
          const res = await api.post("/auth/google", {
            token: credential
          });
          login(res.data);
        }}
        onError={() => alert("Google login failed")}
      />
    </div>
  );
}
