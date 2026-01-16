import React, { useState } from "react";
import PropertyCard from "./PropertyCard";
import PropertyModal from "./PropertyModal";

const PROPERTIES = [
  {
    id: 1,
    title: "Luxury 3-Bedroom Apartment",
    location: "East Legon, Accra",
    price: "120,000",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    description:
      "A modern luxury apartment with premium finishes, spacious rooms, and excellent security.",
  },
  {
    id: 2,
    title: "Modern Studio Flat",
    location: "Osu, Accra",
    price: "60,000",
    image: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6",
    description:
      "Perfect for young professionals, located in the heart of the city.",
  },
  {
    id: 3,
    title: "Spacious Family Home",
    location: "Kumasi, Ashanti",
    price: "95,000",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
    description:
      "Ideal family home with large living spaces and a serene environment.",
  },
  {
    id: 4,
    title: "Beachside Villa",
    location: "Cape Coast",
    price: "200,000",
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
    description:
      "Luxury beachside villa with breathtaking ocean views.",
  },
];

export default function PropertiesSection() {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <section id='properties' className="bg-[#fafafa]scroll-mt-24 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold text-[#8B6F2F]">
              Available Properties
            </h2>
            <p className="mt-3 text-gray-500">
              Explore our latest listings across Ghana — find your dream home today.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {PROPERTIES.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onView={setSelected}
              />
            ))}
          </div>
        </div>
      </section>

      <PropertyModal
        property={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
