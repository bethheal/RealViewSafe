import React from 'react';

import Badge from "../ui/Badge";
import Button from "../ui/Button";

const statusTone = (s) => {
  if (s === "APPROVED") return "green";
  if (s === "PENDING") return "yellow";
  if (s === "REJECTED") return "red";
  if (s === "SOLD") return "purple";
  return "gray";
};

export default function PropertyCard({ property, actions, footer }) {
  return (
    <div className="bg-white/80 backdrop-blur-md border border-white/40 shadow-sm rounded-2xl overflow-hidden">
      <div className="relative">
        <img
          src={property.image || "https://via.placeholder.com/800x500?text=Property"}
          alt={property.title}
          className="h-48 w-full object-cover"
        />
        <div className="absolute top-3 left-3">
          <Badge tone={statusTone(property.status)}>{property.status}</Badge>
        </div>
        {property.featured && (
          <div className="absolute top-3 right-3">
            <Badge tone="orange">Featured</Badge>
          </div>
        )}
      </div>

      <div className="p-5 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-gray-900 line-clamp-1">{property.title}</h3>
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">📍 {property.location}</p>
          </div>
          <p className="text-[#F37A2A] font-extrabold text-base whitespace-nowrap">
            GH₵ {Number(property.price).toLocaleString()}
          </p>
        </div>

        {actions && <div className="pt-2 flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}
