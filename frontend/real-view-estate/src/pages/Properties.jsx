import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PropertiesSection from "../components/PropertiesSection";
import Seo from "../components/Seo";
import api from "../lib/api";

const CATEGORY_ORDER = ["all", "featured", "top", "urgent"];

const CATEGORY_META = {
  all: {
    label: "All Properties",
    subtitle: "Browse every approved property currently available on Real View.",
  },
  featured: {
    label: "Featured Properties",
    subtitle: "Highlighted listings from premium and priority property submissions.",
  },
  top: {
    label: "Top Properties",
    subtitle: "High-value listings selected from our best-performing properties.",
  },
  urgent: {
    label: "Urgent Properties",
    subtitle: "Listings that need quick attention, including active rent and lease offers.",
  },
};

const getNormalizedCategory = (value) =>
  CATEGORY_ORDER.includes(value) ? value : "all";

const getTags = (property) => {
  if (!Array.isArray(property?.tags)) return [];
  return property.tags.map((tag) => String(tag).toLowerCase());
};

const isFeaturedProperty = (property) => {
  const tags = getTags(property);
  const priority = String(property?.priority || "").toLowerCase();
  return Boolean(property?.featured) || priority === "featured" || tags.includes("featured");
};

const isUrgentProperty = (property) => {
  const tags = getTags(property);
  const priority = String(property?.priority || "").toLowerCase();
  return (
    priority === "urgent" ||
    tags.includes("urgent") ||
    ["RENT", "LEASE"].includes(property?.transactionType)
  );
};

export default function PropertiesPage() {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const category = getNormalizedCategory(searchParams.get("category") || "all");
  const categoryMeta = CATEGORY_META[category];

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    api
      .get("/properties")
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res?.data?.data) ? res.data.data : [];
        setItems(list);
      })
      .catch(() => {
        if (!mounted) return;
        setItems([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const topPriceThreshold = useMemo(() => {
    const prices = items
      .map((item) => Number(item?.price) || 0)
      .filter((price) => price > 0)
      .sort((a, b) => b - a);

    if (prices.length === 0) return Number.POSITIVE_INFINITY;
    const cutoffIndex = Math.max(0, Math.floor(prices.length / 3) - 1);
    return prices[cutoffIndex];
  }, [items]);

  const filteredItems = useMemo(() => {
    if (category === "all") return items;
    if (category === "featured") return items.filter(isFeaturedProperty);
    if (category === "top") {
      return items.filter((item) => {
        const price = Number(item?.price) || 0;
        return isFeaturedProperty(item) || price >= topPriceThreshold;
      });
    }
    if (category === "urgent") return items.filter(isUrgentProperty);
    return items;
  }, [category, items, topPriceThreshold]);

  return (
    <>
      <Seo
        title={`${categoryMeta.label} - RealViewEstate`}
        description={categoryMeta.subtitle}
        pathname={`/properties${category === "all" ? "" : `?category=${category}`}`}
      />

      <section className="bg-white pt-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap gap-3">
            {CATEGORY_ORDER.map((key) => {
              const isActive = key === category;
              return (
                <Link
                  key={key}
                  to={key === "all" ? "/properties" : `/properties?category=${key}`}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-[#8B6F2F] text-white"
                      : "border border-gray-200 bg-white text-gray-700 hover:border-[#8B6F2F] hover:text-[#8B6F2F]"
                  }`}
                >
                  {CATEGORY_META[key].label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <PropertiesSection
        items={filteredItems}
        loading={loading}
        title={categoryMeta.label}
        subtitle={categoryMeta.subtitle}
        sectionId="properties-list"
        emptyMessage={`No ${categoryMeta.label.toLowerCase()} found right now.`}
      />
    </>
  );
}
