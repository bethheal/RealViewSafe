import React from 'react';

import { Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  PlusSquare,
  Home,
  FileText,
  BarChart3,
  CreditCard,
  UserCircle,
} from "lucide-react";
import SidebarShell from './Sidebarshell';

export default function AgentsLayout() {
  const links = [
    { to: "/agent/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { to: "/agent/add-property", label: "Add Property", icon: <PlusSquare size={18} /> },
    { to: "/agent/manage-properties", label: "Manage Properties", icon: <Home size={18} /> },
    { to: "/agent/drafts", label: "Drafts", icon: <FileText size={18} /> },
    { to: "/agent/leads", label: "Property Leads", icon: <BarChart3 size={18} /> },
    { to: "/agent/subscription", label: "Subscription", icon: <CreditCard size={18} /> },
    { to: "/agent/profile", label: "Profile", icon: <UserCircle size={18} /> },
  ];

  return (
    <SidebarShell title="Agent" links={links}>
      <Outlet />
    </SidebarShell>
  );
}
