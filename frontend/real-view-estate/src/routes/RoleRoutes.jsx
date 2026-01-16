import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleRoute({ allowedRole, children }) {
  const { user, loading } = useAuth();

  if (loading) return null; // optional: spinner

  if (!user) return <Navigate to="/login" replace />;

  if (user.primaryRole !== allowedRole) {
    return (
      <Navigate
        to={
          user.primaryRole === "AGENT"
            ? "/agent/dashboard"
            : "/buyer/dashboard"
        }
        replace
      />
    );
  }

  return children;
}
