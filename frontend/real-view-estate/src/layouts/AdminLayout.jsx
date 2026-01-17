import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {Outlet } from "react-router-dom";
import SidebarShell from "./Sidebarshell";
import { CreditCard, Home, LayoutDashboard, User2Icon, UserCheck2, UserCircle } from "lucide-react";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = [
    // Define admin-specific links here
    { to: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18}/> },
    { to: "/admin/agents", label: " Agent", icon: <User2Icon size={18}/> },
    {to: "/admin/properties", label: " Properties", icon: <Home size={18}/> },
    {to: "/admin/buyers", label: " Buyers", icon: <UserCheck2 size={18}/> },
    {to: "/admin/subscriptions", label: " Subscriptions", icon: <CreditCard size={18}/> },
    {to: "/admin/profile", label: "Profile", icon: <UserCircle size={18}/> },
  ];

  
  return (
    <div >
      {/* sidebar */}
       <SidebarShell title="Real View" links={links}>
      <Outlet />
    </SidebarShell> 

      
    </div>
  );
}
