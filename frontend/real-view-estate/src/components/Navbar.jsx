import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { logo } from "../assets";

const propertyMenuItems = [
  { label: "All Properties", to: "/properties" },
  { label: "Featured Properties", to: "/properties?category=featured" },
  { label: "Top Properties", to: "/properties?category=top" },
  { label: "Urgent Properties", to: "/properties?category=urgent" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobilePropertiesOpen, setMobilePropertiesOpen] = useState(false);
  const location = useLocation();

  const hideNavbarRoutes = ["/login", "/signup", "/forgot-password"];
  if (hideNavbarRoutes.includes(location.pathname)) return null;

  const closeMenus = () => {
    setMobileOpen(false);
    setMobilePropertiesOpen(false);
  };

  return (
    <header className="fixed top-4 z-50 w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-full bg-[#8B6F2F]/90 px-5 py-3 shadow-lg ring-1 ring-white/15 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-white"
              onClick={closeMenus}
            >
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
                <img src={logo} alt="logo" className="h-full w-full object-contain" />
              </span>
              <span className="text-lg font-semibold tracking-wide">RealView</span>
            </Link>

            <nav className="hidden items-center gap-4 text-sm text-white md:flex">
              <Link to="/" className="rounded-full px-4 py-2 transition hover:bg-white/15">
                Home
              </Link>

              <div className="group relative">
                <Link
                  to="/properties"
                  onClick={closeMenus}
                  className="rounded-full px-4 py-2 transition hover:bg-white/15"
                >
                  Properties
                </Link>
                <div className="invisible absolute left-0 top-12 w-56 translate-y-2 overflow-hidden rounded-2xl border border-white/15 bg-[#8B6F2F] opacity-0 shadow-xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  {propertyMenuItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={closeMenus}
                      className="block px-4 py-3 text-sm text-white transition hover:bg-white/15"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              <Link to="/list-your-property" className="rounded-full px-4 py-2 transition hover:bg-white/15">
                List Your Property
              </Link>
              <Link to="/about-us" className="rounded-full px-4 py-2 transition hover:bg-white/15">
                About Us
              </Link>
              <Link to="/#contact" className="rounded-full px-4 py-2 transition hover:bg-white/15">
                Contact Us
              </Link>
            </nav>

            <div className="hidden items-center gap-2 md:flex">
              <Link
                to="/login"
                className="rounded-full px-4 py-2 text-white/85 transition hover:bg-white/10 hover:text-white"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-white px-4 py-2 font-semibold text-[#8B6F2F] transition hover:bg-white/90"
              >
                Sign Up
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="rounded-full px-3 py-2 text-white/95 transition hover:bg-white/10 md:hidden"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? "X" : "Menu"}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="mt-3 overflow-hidden rounded-2xl bg-[#8B6F2F]/95 shadow-lg ring-1 ring-white/15 backdrop-blur-md md:hidden">
            <div className="flex flex-col gap-1 p-3 text-white">
              <Link to="/" onClick={closeMenus} className="rounded-xl px-4 py-3 transition hover:bg-white/15">
                Home
              </Link>

              <div className="rounded-xl border border-white/15">
                <button
                  type="button"
                  onClick={() => setMobilePropertiesOpen((open) => !open)}
                  className="w-full px-4 py-3 text-left transition hover:bg-white/15"
                >
                  Properties
                </button>
                {mobilePropertiesOpen && (
                  <div className="border-t border-white/15">
                    {propertyMenuItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={closeMenus}
                        className="block px-6 py-3 text-sm transition hover:bg-white/15"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                to="/list-your-property"
                onClick={closeMenus}
                className="rounded-xl px-4 py-3 transition hover:bg-white/15"
              >
                List Your Property
              </Link>
              <Link to="/about-us" onClick={closeMenus} className="rounded-xl px-4 py-3 transition hover:bg-white/15">
                About Us
              </Link>
              <Link to="/#contact" onClick={closeMenus} className="rounded-xl px-4 py-3 transition hover:bg-white/15">
                Contact Us
              </Link>

              <div className="my-2 h-px bg-white/15" />

              <Link to="/login" onClick={closeMenus} className="rounded-xl px-4 py-3 transition hover:bg-white/15">
                Log In
              </Link>
              <Link
                to="/signup"
                onClick={closeMenus}
                className="rounded-xl bg-white px-4 py-3 font-semibold text-[#8B6F2F] transition hover:bg-white/90"
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
