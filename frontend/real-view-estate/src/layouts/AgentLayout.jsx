import React from 'react';
import { useNavigate } from "react-router-dom";


import { Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  PlusSquare,
  Home,
  FileText,
  BarChart3,
  CreditCard,
  UserCircle,
  Plus,
} from "lucide-react";
import SidebarShell from './Sidebarshell';

export default function AgentsLayout() {
    const navigate = useNavigate();

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
    <SidebarShell title="Real View" links={links}>
       <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => navigate("/agent/add-property")}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F37A2A] text-white font-extrabold text-sm hover:opacity-90"
            >
              <Plus size={16} />
              Add Property
            </button>
            <button
              onClick={() => navigate("/agent/drafts")}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 font-extrabold text-sm hover:bg-gray-50"
            >
              <FileText size={16} />
              Drafts
            </button>
          </div>
      <Outlet />
    </SidebarShell>
  );
}
