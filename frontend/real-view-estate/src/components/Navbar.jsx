import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { logo } from "../assets";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Hide navbar on auth pages
  const hideNavbarRoutes = ["/login", "/signup", "/forgot-password"];
  if (hideNavbarRoutes.includes(location.pathname)) return null;

  const navItems = useMemo(
    () => [
      { name: "Home", id: "home" },
      { name: "About", id: "about" },
      { name: "Services", id: "services" },
      { name: "Properties", id: "properties" },
      { name: "Contact", id: "contact" },
      { name: "FAQ", id: "faq" },
    ],
    []
  );

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <header className="fixed top-4 z-50 w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* pill container like the image */}
        <div className="rounded-full bg-[#8B6F2F]/90 backdrop-blur-md shadow-lg ring-1 ring-white/15 px-5 py-3 flex items-center justify-between">
          {/* Brand */}
          <Link
            to="/"
            className="text-white font-semibold tracking-wide flex items-center gap-2"
            onClick={() => setOpen(false)}
          >
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
  <img src={logo} alt="logo" className="w-full h-full object-contain" />
</span>
<span className="text-lg">RealView</span>

          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 text-sm text-white">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="px-4 py-2 rounded-full hover:bg-white/15 transition"
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-2 rounded-full text-white/85 hover:text-white hover:bg-white/10 transition"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-full bg-white text-[#8B6F2F] font-semibold hover:bg-white/90 transition"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden text-white/95 px-3 py-2 rounded-full hover:bg-white/10 transition"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Menu (dropdown card under pill) */}
        {open && (
          <div className="mt-3 rounded-2xl bg-[#8B6F2F]/95 backdrop-blur-md shadow-lg ring-1 ring-white/15 overflow-hidden md:hidden">
            <div className="p-3 flex flex-col gap-1 text-white">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-left px-4 py-3 rounded-xl hover:bg-white/15 transition"
                >
                  {item.name}
                </button>
              ))}

              <div className="h-px bg-white/15 my-2" />

              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-xl hover:bg-white/15 transition"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-xl bg-white text-[#8B6F2F] font-semibold hover:bg-white/90 transition"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
