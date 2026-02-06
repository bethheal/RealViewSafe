import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SiteJsonLd from "../components/SiteJsonLd";

export default function RootLayout() {
  return (
    <>
      <SiteJsonLd />
      <Navbar />
      <main className="pt-20">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
