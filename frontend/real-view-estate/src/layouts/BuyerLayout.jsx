import React from 'react';

import { Outlet } from "react-router-dom";
import { LayoutDashboard, Search, Heart, ShoppingBag, UserCircle } from "lucide-react";
import SidebarShell from './Sidebarshell';
import { logo } from "../assets";

export default function BuyerLayout() {
  const links = [
    { to: "/buyer/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { to: "/buyer/browse", label: "Browse Properties", icon: <Search size={18} /> },
    { to: "/buyer/saved", label: "Saved Properties", icon: <Heart size={18} /> },
    { to: "/buyer/purchases", label: "Properties Bought", icon: <ShoppingBag size={18} /> },
    { to: "/buyer/profile", label: "Profile", icon: <UserCircle size={18} /> },
  ];
  

  return (
    <SidebarShell title="Real View" links={links} logoSrc={logo}>
      <Outlet />
    </SidebarShell>
  );
}
