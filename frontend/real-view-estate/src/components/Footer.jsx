import React from "react";
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
    <footer className="bg-[#8B6F2F] text-white">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-semibold">RealView</h3>
            <p className="mt-4 text-white/80 leading-relaxed">
              Connecting people with trusted properties across Ghana.
              Find homes, rentals, and investments with confidence.
            </p>

            <div className="mt-6 flex gap-4">
              <Facebook className="h-5 w-5 cursor-pointer opacity-80 hover:opacity-100" />
              <Instagram className="h-5 w-5 cursor-pointer opacity-80 hover:opacity-100" />
              <Twitter className="h-5 w-5 cursor-pointer opacity-80 hover:opacity-100" />
              <Linkedin className="h-5 w-5 cursor-pointer opacity-80 hover:opacity-100" />
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4 text-lg font-medium">Quick Links</h4>
            <ul className="space-y-3 text-white/80">
              <li>Home</li>
              <li>Properties</li>
              <li>Services</li>
              <li>FAQ / Help</li>
              <li>Contact Us</li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="mb-4 text-lg font-medium">Our Services</h4>
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
            <h4 className="mb-4 text-lg font-medium">Contact</h4>
            <ul className="space-y-4 text-white/80">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 shrink-0" />
                <span>12 Real Estate Ave, East Legon, Accra</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5" />
                <span>+233 55 123 4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5" />
                <span>support@realview.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Globe className="h-5 w-5" />
                <span>www.realview.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 text-center text-sm text-white/70">
        <Copyright/>
        </div>
      </div>
    </footer>
  );
}
