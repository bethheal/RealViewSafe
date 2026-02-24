import React from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  MapPin,
  Phone,
  Mail,
  Globe,
} from "lucide-react";
import Copyright from "./Copyright";

export default function Footer() {
  return (
    <footer className="relative bg-[#8B6F2F] text-white overflow-hidden">
      {/* geometric lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1200 400"
        preserveAspectRatio="none"
      >
        <g
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1"
          fill="none"
        >
          <path d="M0 300 L300 200 L600 260 L900 180 L1200 240" />
          <path d="M0 120 L280 160 L540 120 L820 160 L1200 100" />
          <path d="M200 400 L500 200 L800 400" />
          <path d="M1000 0 L800 200 L1000 400" />
        </g>
      </svg>

      <div className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-semibold tracking-wide">
              RealView
            </h3>
            <p className="mt-4 text-white/80 leading-relaxed">
              Connecting people with trusted properties across Ghana.
              Find homes, rentals, and investments with confidence.
            </p>

            <div className="mt-6 flex gap-4 text-white/80">
              <Facebook className="h-5 w-5 cursor-pointer hover:text-white" />
              <Instagram className="h-5 w-5 cursor-pointer hover:text-white" />
              <Twitter className="h-5 w-5 cursor-pointer hover:text-white" />
              <Linkedin className="h-5 w-5 cursor-pointer hover:text-white" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide">
              Quick Links
            </h4>
            <ul className="space-y-3 text-white/80">
              <li className="hover:text-white cursor-pointer">Home</li>
              <li className="hover:text-white cursor-pointer">Properties</li>
              <li className="hover:text-white cursor-pointer">Services</li>
              <li className="hover:text-white cursor-pointer">FAQ / Help</li>
              <li className="hover:text-white cursor-pointer">Contact Us</li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide">
              Our Services
            </h4>
            <ul className="space-y-3 text-white/80">
              <li>Property Sales</li>
              <li>Rentals & Leasing</li>
              <li>Property Management</li>
              <li>Consulting</li>
              <li>Valuation</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide">
              Contact
            </h4>
            <ul className="space-y-4 text-white/80">
              <li className="flex gap-3">
                <MapPin className="h-5 w-5 text-white" />
                <span>GM190 Pomegranate ST, Kasoa</span>
              </li>
              <li className="flex gap-3">
                <Phone className="h-5 w-5 text-white" />
                <span>0505692492</span>
              </li>
              <li className="flex gap-3">
                <Mail className="h-5 w-5 text-white" />
                <span>realview@realviewgh.com</span>
              </li>
              <li className="flex gap-3">
                <Globe className="h-5 w-5 text-white" />
                <span>www.realviewgh.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 flex justify-center items-center gap-2 text-sm text-white/70">
          <Copyright />
          <Link
            to="/admin/login"
            className="opacity-40 hover:opacity-80 transition"
            aria-label="Staff access"
          >
            Staff
          </Link>
        </div>
      </div>
    </footer>
  );
}
