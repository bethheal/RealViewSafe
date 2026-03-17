import React, { useState } from "react";
import PropertyCard from "./PropertyCard";
import PropertyModal from "./PropertyModal";

export default function PropertiesSection({
  items = [],
  loading = false,
  emptyMessage,
  title = "Available Properties",
  subtitle = "Explore our latest listings across Ghana - find your dream home today.",
  sectionId = "properties",
}) {
  const [selected, setSelected] = useState(null);
  const list = Array.isArray(items) ? items : [];

  return (
    <>
      <section id={sectionId} className="bg-[#fafafa] scroll-mt-24 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold text-[#8B6F2F]">
              {title}
            </h2>
            <p className="mt-3 text-gray-500">
              {subtitle}
            </p>
          </div>

          {loading ? (
            <div className="text-center text-gray-500 font-semibold">Loading...</div>
          ) : list.length === 0 ? (
            <div className="text-center text-gray-500 font-semibold">
              {emptyMessage || "No properties available right now."}
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {list.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onView={setSelected}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <PropertyModal property={selected} onClose={() => setSelected(null)} />
    </>
  );
}
