// Sidebarshell.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, Camera, Trash2, Loader2 } from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

// ---------- helpers ----------
function initials(name = "") {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

function isValidUrl(u) {
  try {
    new URL(u);
    return true;
  } catch {
    return false;
  }
}

export default function SidebarShell({ title, links, children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth?.() || {};

  const [open, setOpen] = useState(false);

  // Profile state (optional: can come from backend)
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Avatar editor state
  const fileRef = useRef(null);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarErr, setAvatarErr] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  // ✅ cache buster that only changes when upload succeeds
  const [avatarVersion, setAvatarVersion] = useState(0);

  // baseURL = VITE_API_URL + "/api" ✅ so these are correct:
  const ME_ENDPOINT = "/auth/me";
  const UPLOAD_AVATAR_ENDPOINT = "/auth/me/avatar";

  useEffect(() => setOpen(false), [location.pathname]);

  // ✅ Role-based redirect path for logout
  const loginPath = useMemo(() => {
    const roles = user?.roles || user?.role || [];
    const roleNames = Array.isArray(roles)
      ? roles.map((r) => (typeof r === "string" ? r : r?.name)).filter(Boolean)
      : [roles];

    if (roleNames.includes("ADMIN")) return "/admin/login";
    if (roleNames.includes("AGENT")) return "/login";
    if (roleNames.includes("BUYER")) return "/login";
    return "/login";
  }, [user]);

  const handleLogout = () => {
    if (logout) logout();
    navigate(loginPath);
  };

  // Fetch "me" profile
  useEffect(() => {
    let alive = true;

    async function loadMe() {
      try {
        setProfileLoading(true);
        const res = await api.get(ME_ENDPOINT);
        if (!alive) return;

        // backend returns: { user: {...} }
        const data = res?.data?.data ?? res?.data;
        const me = data?.user || null;
        setProfile(me);

        // ✅ bump version once when we receive avatarUrl (helps refresh after login)
        if (me?.avatarUrl) setAvatarVersion((v) => v + 1);
      } catch {
        if (alive) setProfile(null);
      } finally {
        if (alive) setProfileLoading(false);
      }
    }

    loadMe();
    return () => {
      alive = false;
    };
  }, []);

  // Prefer latest profile fullName, fallback to AuthContext fullName
  const displayFullName = useMemo(() => {
    return profile?.fullName || user?.fullName || "User";
  }, [profile?.fullName, user?.fullName]);

  const firstName = useMemo(() => {
    return displayFullName.trim().split(" ")[0] || "User";
  }, [displayFullName]);

  // avatarUrl (can be /uploads/... or full URL)
  const avatarUrl = useMemo(() => {
    const a = profile?.avatarUrl || user?.avatarUrl || "";
    return a && (a.startsWith("/") || isValidUrl(a)) ? a : "";
  }, [profile?.avatarUrl, user?.avatarUrl]);

  const resolvedAvatarUrl = useMemo(() => {
  if (!avatarUrl) return "";
  if (isValidUrl(avatarUrl)) return avatarUrl;

  // remove any trailing slash from VITE_API_URL
  const rawBase = import.meta.env.VITE_API_URL || "";
  const base = rawBase.replace(/\/+$/, ""); // ✅ removes trailing /

  return `${base}${avatarUrl}`; // avatarUrl already starts with "/"
}, [avatarUrl]);


  // ✅ stable final image src (no flicker)
  const avatarSrc = useMemo(() => {
    if (!resolvedAvatarUrl) return "";
    return `${resolvedAvatarUrl}?v=${avatarVersion}`;
  }, [resolvedAvatarUrl, avatarVersion]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function openAvatarEditor() {
    setAvatarErr("");
    setPreviewUrl("");
    setAvatarOpen(true);
  }

  function closeAvatarEditor() {
    setAvatarErr("");
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    setAvatarOpen(false);
  }

  async function handlePickFile(e) {
    setAvatarErr("");
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(file.type)) {
      setAvatarErr("Please upload a PNG, JPG, or WEBP image.");
      e.target.value = "";
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setAvatarErr("Image is too large (max 3MB).");
      e.target.value = "";
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      setAvatarBusy(true);

      const form = new FormData();
      form.append("avatar", file);

      const res = await api.patch(UPLOAD_AVATAR_ENDPOINT, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = res?.data?.data ?? res?.data;
      const newUrl = data?.user?.avatarUrl;

      if (!newUrl) {
        setAvatarErr("Upload succeeded but no avatarUrl returned by server.");
      } else {
        setProfile((p) => ({ ...(p || {}), avatarUrl: newUrl }));

        // ✅ bump version ONCE -> refresh image without flicker
        setAvatarVersion((v) => v + 1);

        // keep localStorage user in sync (optional)
        try {
          const stored = JSON.parse(localStorage.getItem("user") || "null");
          if (stored) {
            stored.avatarUrl = newUrl;
            localStorage.setItem("user", JSON.stringify(stored));
          }
        } catch {}

        closeAvatarEditor();
      }
    } catch (err) {
      setAvatarErr(err?.response?.data?.message || "Failed to upload avatar.");
    } finally {
      setAvatarBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  // Remove avatar (local-only)
  function handleRemoveAvatar() {
    setProfile((p) => ({ ...(p || {}), avatarUrl: null }));
    setAvatarVersion((v) => v + 1);
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "null");
      if (stored) {
        stored.avatarUrl = null;
        localStorage.setItem("user", JSON.stringify(stored));
      }
    } catch {}
    closeAvatarEditor();
  }

  const AvatarBlock = (
    <button
      type="button"
      onClick={openAvatarEditor}
      className="relative w-10 h-10 rounded-2xl overflow-hidden bg-gray-900 text-white flex items-center justify-center font-extrabold"
      title="Edit avatar"
      aria-label="Edit avatar"
    >
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt={displayFullName}
          className="w-full h-full object-cover"
        onError={(e) => {
  console.warn("Avatar load failed:", e.currentTarget.src);
}}

        />
      ) : (
        <span>{initials(displayFullName)}</span>
      )}

      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white text-gray-900 flex items-center justify-center shadow">
        <Camera size={12} />
      </span>
    </button>
  );

  const SidebarContent = (
    <div className="h-full flex flex-col">
      <div className="px-3 pb-4 border-b border-gray-100">
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
          onClick={handleLogout}
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
          {/* LEFT */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu />
            </button>

            <div className="flex items-center gap-3">
              {AvatarBlock}
              <div>
                <p className="text-sm text-gray-600 font-semibold">
                  {profileLoading ? "Loading..." : "Welcome back"}
                </p>
                <p className="text-lg font-extrabold text-gray-900">{firstName}</p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <button
            onClick={handleLogout}
            className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl font-extrabold text-sm bg-gray-900 text-white hover:opacity-90 transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block bg-white/70 backdrop-blur-md border border-white/40 shadow-sm rounded-2xl p-4 h-fit sticky top-6">
            {SidebarContent}
          </aside>

          {/* Mobile drawer */}
          {open && (
            <div className="lg:hidden fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
              <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-[360px] bg-white p-4 shadow-2xl">
                <div className="flex items-center justify-between mb-3">
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

      {/* Avatar editor modal */}
      {avatarOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/30" onClick={closeAvatarEditor} />

          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-gray-900">Edit avatar</h3>
              <button
                type="button"
                onClick={closeAvatarEditor}
                className="p-2 rounded-xl hover:bg-gray-100"
                aria-label="Close"
              >
                <X />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-900 text-white flex items-center justify-center font-extrabold">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : avatarSrc ? (
                  <img src={avatarSrc} alt={displayFullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">{initials(displayFullName)}</span>
                )}
              </div>

              <div className="flex-1">
                <p className="font-bold text-gray-900">{displayFullName}</p>
                <p className="text-sm text-gray-600">Upload a square image for best results.</p>
              </div>
            </div>

            {avatarErr ? (
              <div className="mt-4 bg-red-50 text-red-700 text-sm p-3 rounded-xl">{avatarErr}</div>
            ) : null}

            <div className="mt-5 flex gap-3">
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handlePickFile}
              />

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={avatarBusy}
                className="flex-1 rounded-xl bg-gray-900 text-white py-2 font-extrabold disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {avatarBusy ? <Loader2 className="animate-spin" size={18} /> : <Camera size={18} />}
                {avatarBusy ? "Uploading..." : "Upload photo"}
              </button>

              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={avatarBusy || (!avatarSrc && !previewUrl)}
                className="rounded-xl border border-gray-200 py-2 px-3 font-extrabold text-gray-900 disabled:opacity-50 flex items-center gap-2"
                title="Remove avatar (local only)"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <p className="mt-3 text-xs text-gray-500">Allowed: JPG/PNG/WEBP • Max 3MB</p>
          </div>
        </div>
      )}
    </div>
  );
}
