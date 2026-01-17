// App.jsx
import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import RootLayout from "./layouts/RootLayout";
import AuthLayout from "./layouts/AuthLayout";
import BuyerLayout from "./layouts/BuyerLayout";
import AgentLayout from "./layouts/AgentLayout";
import AdminLayout from "./layouts/AdminLayout"; // if you have it

import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import Home from "./pages/Home";

import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoutes";

import BuyerDashboard from "./pages/buyer/BuyerDashboard";
import AgentDashboard from "./pages/agent/AgentDashboard";
import AdminDashboard from "./pages/admin/AdminDasboard";
import BrowseProperties from "./pages/buyer/BrowseProperties";
import SaveProperties from "./pages/buyer/SavedProperties";
import PurchaseProperties from "./pages/buyer/PurchaseProperties";
import BuyerProfile from "./pages/buyer/BuyerProfile";
import AddProperty from "./pages/agent/AddProperty";
import ManageProperties from "./pages/agent/ManageProperties";
import PropertyLead from "./pages/agent/PropertyLeads";
import Subscription from "./pages/agent/Subscription";
import AgentProfile from "./pages/agent/AgentProfile";
import PropertyDraft from "./pages/agent/PropertyDrafts";
import AdminBuyers from "./pages/admin/AdminBuyers";
import AdminProperties from "./pages/admin/AdminProperties";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminAgents from "./pages/admin/AdminAgents";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminChangePassword from "./pages/admin/AdminChangePassword";  

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 7000,
          style: {
            background: "rgba(0,0,0,0.85)",
            color: "#fff",
            backdropFilter: "blur(8px)",
          },
        }}
      />

      <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
        <Routes>
          {/* PUBLIC */}
          <Route element={<RootLayout />}>
            <Route index element={<Home />} />
          </Route>

          {/* AUTH */}
          <Route element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* BUYER (LAYOUT + PAGES) */}
          <Route
            path="/buyer"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="BUYER">
                  <BuyerLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<BuyerDashboard />} />
            <Route path="browse" element={<BrowseProperties />} />
            <Route path="saved" element={<SaveProperties />} />
            <Route path="purchases" element={<PurchaseProperties />} />
            <Route path="profile" element={<BuyerProfile />} />
          </Route>

          {/* AGENT (LAYOUT + PAGES) */}
          <Route
            path="/agent"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="AGENT">
                  <AgentLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AgentDashboard />} />
            <Route path="add-property" element={<AddProperty />} />
            <Route path="drafts" element={<PropertyDraft />} />
            <Route path="manage-properties" element={<ManageProperties />} />
            <Route path="leads" element={<PropertyLead />} />
            <Route path="subscription" element={<Subscription />} />
            <Route path="profile" element={<AgentProfile />} />
          </Route>

          <Route path="admin/login" element={<AdminLogin />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="ADMIN">
                  <AdminLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="agents" element={<AdminAgents />} />
            <Route path="buyers" element={<AdminBuyers />} />
            <Route path="properties" element={<AdminProperties />} />
            <Route path="subscriptions" element={<AdminSubscriptions />} />
            <Route path="profile" element={<AdminProfile />} />

            <Route path="change-password" element={<AdminChangePassword />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
