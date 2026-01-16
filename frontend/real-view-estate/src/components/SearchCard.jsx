import React from 'react'

import { useState } from "react";

export default function SearchCard() {
  const [type, setType] = useState("rent");

  return (
    <div className="rounded-3xl bg-white/15 p-8 backdrop-blur-xl shadow-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Search Properties For
        </h3>

        <div className="flex rounded-xl bg-white/20 p-1">
          <button
            onClick={() => setType("rent")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition
              ${type === "rent"
                ? "bg-orange-500 text-white"
                : "text-white/70 hover:text-white"}`}
          >
            Rent
          </button>

          <button
            onClick={() => setType("buy")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition
              ${type === "buy"
                ? "bg-orange-500 text-white"
                : "text-white/70 hover:text-white"}`}
          >
            Buy
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <select className="rounded-xl bg-white/20 px-4 py-3 text-sm text-white outline-none">
          <option>Choose Location</option>
        </select>
        <select className="rounded-xl bg-white/20 px-4 py-3 text-sm text-white outline-none">
          <option>Property Type</option>
        </select>
        <select className="rounded-xl bg-white/20 px-4 py-3 text-sm text-white outline-none">
          <option>Bedrooms</option>
        </select>
        <select className="rounded-xl bg-white/20 px-4 py-3 text-sm text-white outline-none">
          <option>Bathrooms</option>
        </select>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div>
          <div className="mb-2 flex justify-between text-sm text-white">
            <span>Price Range ($)</span>
            <span className="text-orange-400">$4,000</span>
          </div>
          <input type="range" className="w-full accent-orange-500" />
        </div>

        <div>
          <div className="mb-2 flex justify-between text-sm text-white">
            <span>Area Range (sqm)</span>
            <span className="text-orange-400">1200 m²</span>
          </div>
          <input type="range" className="w-full accent-orange-500" />
        </div>
      </div>

      <div className="mt-10 text-center">
        <button className="rounded-2xl bg-orange-500 px-10 py-4 text-sm font-semibold text-white shadow-lg hover:bg-orange-600">
          Search Properties →
        </button>
      </div>
    </div>
  );
}
