import React from "react";

export default function PropertyModal({ property, onClose }) {
  if (!property) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <img
          src={property.image}
          alt={property.title}
          className="h-72 w-full object-cover"
        />

        <div className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {property.title}
              </h2>
              <p className="text-gray-500">
                📍 {property.location}
              </p>
            </div>

            <button
              onClick={onClose}
              className="text-xl text-gray-400 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <p className="mb-6 text-gray-600">
            {property.description}
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-2xl font-bold text-[#8B6F2F]">
              ${property.price}
            </p>

            <button className="rounded-xl bg-[#8B6F2F] px-6 py-3 font-semibold text-white hover:bg-[#7a6128]">
              Contact Agent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
