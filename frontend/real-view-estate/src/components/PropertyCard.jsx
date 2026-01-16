import React from "react";

export default function PropertyCard({ property, onView }) {
  return (
    <div
      className="
        group rounded-2xl  bg-white transition-all duration-300
        hover:bg-[#8B6F2F] hover:text-white hover:shadow-xl
      "
    >
      <img
        src={property.image}
        alt={property.title}
        className="h-56 w-full rounded-t-2xl object-cover"
      />

      <div className="p-6">
        <h3 className="mb-1 text-lg font-semibold">
          {property.title}
        </h3>

        <p className="mb-3 flex items-center gap-1 text-sm text-gray-500 group-hover:text-white/80">
          📍 {property.location}
        </p>

        <p className="mb-5 text-lg font-bold text-[#8B6F2F] group-hover:text-white">
          ${property.price}
        </p>

        <button
          onClick={() => onView(property)}
          className="
            w-full rounded-xl border border-[#8B6F2F] px-4 py-2 font-medium
            text-[#8B6F2F] transition
            group-hover:border-white group-hover:bg-white group-hover:text-[#8B6F2F]
          "
        >
          View Details
        </button>
      </div>
    </div>
  );
}
