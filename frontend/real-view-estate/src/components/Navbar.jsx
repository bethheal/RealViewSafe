import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Hide navbar on auth pages
  const hideNavbarRoutes = ["/login", "/signup", "/forgot-password"];

  if (hideNavbarRoutes.includes(location.pathname)) {
    return null;
  }

  const navItems = [
    { name: "Home", id: "home" },
    { name: "Services", id: "services" },
    { name: "Properties", id: "properties" },
    { name: "Contact", id: "contact" },
    { name: "FAQ", id: "faq" },
  ];

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setOpen(false);
    }
  };

  return (
    <header className="fixed top-0 z-50 w-full bg-[#8B6F2F]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-bold text-white">
          RealView
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8 text-sm text-white">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="hover:text-white/80 transition"
            >
              {item.name}
            </button>
          ))}
        </nav>

        {/* Auth */}
        <div className="hidden md:flex gap-4">
          <Link to="/login" className="text-white/80 hover:text-white">
            Log In
          </Link>
          <Link to="/signup" className="text-white font-medium">
            Sign Up
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-white text-2xl"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden flex flex-col gap-4 px-6 pb-6 text-white">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="text-left"
            >
              {item.name}
            </button>
          ))}
          <Link to="/login" onClick={() => setOpen(false)}>
            Log In
          </Link>
          <Link to="/signup" onClick={() => setOpen(false)}>
            Sign Up
          </Link>
        </div>
      )}
    </header>
  );
}
