import React, { useEffect, useMemo, useState } from "react";
import WhyBest from "../components/WhyBest";
import PropertiesSection from "../components/PropertiesSection";
import Contact from "../components/Contact";
import FAQ from "../components/FAQ";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
// import Footer from "../components/Footer";
import api from "../lib/api";
import AboutSection from "../components/AboutSection";
import Seo from "../components/Seo";

export default function Home() {
  const [allProperties, setAllProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "",
    location: "",
    propertyType: "",
    bedrooms: "",
    bathrooms: "",
    priceMax: 0,
    sizeMax: 0,
  });

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get("/properties")
      .then((res) => {
        if (!active) return;
        const list = Array.isArray(res?.data?.data) ? res.data.data : [];
        setAllProperties(list);
      })
      .catch(() => {
        if (!active) return;
        setAllProperties([]);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const searchOptions = useMemo(() => {
    const locations = Array.from(
      new Set(allProperties.map((p) => p.location).filter(Boolean)),
    ).sort();

    const typeLabels = {
      HOUSE: "House",
      APARTMENT: "Apartment",
      COMMERCIAL: "Commercial",
      LAND: "Land",
    };
    const types = Array.from(
      new Set(allProperties.map((p) => p.type).filter(Boolean)),
    ).map((value) => ({
      value,
      label: typeLabels[value] || value,
    }));

    const bedrooms = Array.from(
      new Set(allProperties.map((p) => p.bedrooms).filter((v) => Number.isFinite(v))),
    ).sort((a, b) => a - b);

    const bathrooms = Array.from(
      new Set(allProperties.map((p) => p.bathrooms).filter((v) => Number.isFinite(v))),
    ).sort((a, b) => a - b);

    const maxPrice = allProperties.reduce((m, p) => Math.max(m, Number(p.price) || 0), 0);
    const maxSize = allProperties.reduce((m, p) => Math.max(m, Number(p.sizeSqm) || 0), 0);

    return { locations, types, bedrooms, bathrooms, maxPrice, maxSize };
  }, [allProperties]);

  const filtered = useMemo(() => {
    const rentTypes = new Set(["RENT", "LEASE"]);
    const buyTypes = new Set(["SALE"]);

    return allProperties.filter((p) => {
      if (filters.type === "rent" && !rentTypes.has(p.transactionType)) return false;
      if (filters.type === "buy" && !buyTypes.has(p.transactionType)) return false;

      if (filters.location) {
        const hay = String(p.location || "").toLowerCase();
        const needle = String(filters.location || "").toLowerCase();
        if (!hay.includes(needle)) return false;
      }

      if (filters.propertyType && p.type !== filters.propertyType) return false;

      if (filters.bedrooms) {
        if (Number(p.bedrooms || 0) < Number(filters.bedrooms)) return false;
      }

      if (filters.bathrooms) {
        if (Number(p.bathrooms || 0) < Number(filters.bathrooms)) return false;
      }

      if (filters.priceMax) {
        if (Number(p.price || 0) > Number(filters.priceMax)) return false;
      }

      if (filters.sizeMax) {
        if (Number(p.sizeSqm || 0) > Number(filters.sizeMax)) return false;
      }

      return true;
    });
  }, [allProperties, filters]);

  const handleSearch = (nextFilters) => {
    setFilters((prev) => ({ ...prev, ...nextFilters }));
    const el = document.getElementById("properties");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Seo
        title="Find Land, Houses & Offices in Accra"
        description="Explore verified land, houses and office listings across Accra. Buy or rent with confidence — Real View Estate connects you with trusted sellers and agents."
        pathname="/"
      />
      <Navbar />
      <Hero searchOptions={searchOptions} onSearch={handleSearch} />
      <AboutSection />
      <WhyBest />
      <PropertiesSection
        items={filtered}
        loading={loading}
        emptyMessage="No properties match your search."
      />
      <FAQ />
      <Contact />
      {/* <Footer /> */}
    </>
  );
}
