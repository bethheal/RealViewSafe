import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, Plus, FileText } from "lucide-react";
import { agentService } from "../services/agent.service"; // adjust path if needed
import { useAuth } from "../context/AuthContext"; // adjust to your auth context

function initials(name = "") {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "A";
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

export default function SidebarShell({ title, links, children }) {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth?.() || {};

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    // pull profile for welcome + avatar
    agentService
      .getProfile()
      .then((res) => setProfile(res.data))
      .catch(() => setProfile(null));
  }, []);

  const firstName = useMemo(() => {
    const full = profile?.fullName || "";
    return full.trim().split(" ")[0] || "Agent";
  }, [profile]);

  const SidebarContent = (
    <div className="h-full flex flex-col">
      <div className="px-3 pb-4 border-b border-gray-100">
        <p className="text-xs font-extrabold text-gray-500 uppercase tracking-widest">
          Portal
        </p>
        <h2 className="text-xl font-extrabold text-[#F37A2A] mt-1">{title}</h2>
      </div>

      <nav className="pt-4 space-y-2 flex-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition
               ${isActive ? "bg-orange-100 text-[#F37A2A]" : "text-gray-700 hover:bg-gray-100"}`
            }
          >
            <span className={`${location.pathname === l.to ? "text-[#F37A2A]" : "text-gray-400"}`}>
              {l.icon}
            </span>
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="pt-3 border-t border-gray-100">
        <button
          onClick={() => (logout ? logout() : navigate("/login"))}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-extrabold text-sm bg-gray-900 text-white hover:opacity-90 transition"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff8ec] to-[#ffe3c2]">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-6">
        {/* Topbar */}
        <div className="mb-6 bg-white/70 backdrop-blur-md border border-white/40 shadow-sm rounded-2xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gray-900 text-white flex items-center justify-center font-extrabold">
                {initials(profile?.fullName)}
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold">Welcome back</p>
                <p className="text-lg font-extrabold text-gray-900">{firstName}</p>
              </div>
            </div>
          </div>

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
        </div>

        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block bg-white/70 backdrop-blur-md border border-white/40 shadow-sm rounded-2xl p-4 h-fit sticky top-6">
            {SidebarContent}
          </aside>

          {/* Mobile drawer */}
          {open && (
            <div className="lg:hidden fixed inset-0 z-50">
              <div
                className="absolute inset-0 bg-black/30"
                onClick={() => setOpen(false)}
              />
              <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-[360px] bg-white p-4 shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-extrabold text-gray-900">Menu</p>
                  <button
                    className="p-2 rounded-xl hover:bg-gray-100"
                    onClick={() => setOpen(false)}
                    aria-label="Close menu"
                  >
                    <X />
                  </button>
                </div>
                {SidebarContent}
              </div>
            </div>
          )}

          {/* Main */}
          <main className="space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
