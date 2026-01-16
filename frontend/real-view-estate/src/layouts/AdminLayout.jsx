import React from 'react'

import { Outlet } from "react-router-dom";
import { LayoutDashboard, Users, Home, CreditCard, UserCircle } from "lucide-react";
import SidebarShell from './Sidebarshell';

export default function AdminLayout() {
  const links = [
    { to: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { to: "/admin/agents", label: "Agents", icon: <Users size={18} /> },
    { to: "/admin/buyers", label: "Buyers", icon: <Users size={18} /> },
    { to: "/admin/properties", label: "Properties", icon: <Home size={18} /> },
    { to: "/admin/subscriptions", label: "Subscriptions", icon: <CreditCard size={18} /> },
    { to: "/admin/profile", label: "Profile", icon: <UserCircle size={18} /> },
  ];

  return (
    <SidebarShell title="Admin" links={links}>
      <Outlet />
    </SidebarShell>
  );
}
