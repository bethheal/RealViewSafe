import React, { useEffect, useState } from "react";

import { formatGhs } from "../lib/media";

export default function SearchCard({ options, onSearch }) {
  const [type, setType] = useState("rent");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [priceMax, setPriceMax] = useState(0);
  const [sizeMax, setSizeMax] = useState(0);

  const locations = options?.locations || [];
  const types = options?.types || [];
  const bedroomOptions = options?.bedrooms || [];
  const bathroomOptions = options?.bathrooms || [];
  const maxPrice = options?.maxPrice || 0;
  const maxSize = options?.maxSize || 0;

  useEffect(() => {
    if (maxPrice && (!priceMax || priceMax > maxPrice)) {
      setPriceMax(maxPrice);
    }
  }, [maxPrice, priceMax]);

  useEffect(() => {
    if (maxSize && (!sizeMax || sizeMax > maxSize)) {
      setSizeMax(maxSize);
    }
  }, [maxSize, sizeMax]);

  const runSearch = () => {
    if (!onSearch) return;
    onSearch({
      type,
      location,
      propertyType,
      bedrooms,
      bathrooms,
      priceMax,
      sizeMax,
    });
  };

  return (
    <div className="rounded-3xl bg-white/15 p-8 backdrop-blur-xl shadow-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Search Properties For</h3>

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
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="rounded-xl bg-white/20 px-4 py-3 text-sm text-orange-500 outline-none"
        >
          <option value="">Choose Location</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>

        <select
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          className="rounded-xl bg-white/20 px-4 py-3 text-sm text-orange-500 outline-none"
        >
          <option value="">Property Type</option>
          {types.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        {/* <select
          value={bedrooms}
          onChange={(e) => setBedrooms(e.target.value)}
          className="rounded-xl bg-white/20 px-4 py-3 text-sm text-orange-500 outline-none"
        >
          <option value="">Bedrooms</option>
          {bedroomOptions.map((b) => (
            <option key={b} value={b}>
              {b}+
            </option>
          ))}
        </select> */}

        {/* <select
          value={bathrooms}
          onChange={(e) => setBathrooms(e.target.value)}
          className="rounded-xl bg-white/20 px-4 py-3 text-sm text-white outline-none"
        >
          <option value="">Bathrooms</option>
          {bathroomOptions.map((b) => (
            <option key={b} value={b}>
              {b}+
            </option>
          ))}
        </select> */}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div>
          <div className="mb-2 flex justify-between text-sm text-white">
            <span>Price Range (GHS)</span>
            <span className="text-orange-400">
              {maxPrice ? formatGhs(priceMax) : "GHS 0"}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={maxPrice || 0}
            step={100}
            value={priceMax}
            onChange={(e) => setPriceMax(Number(e.target.value))}
            className="w-full accent-orange-500"
            disabled={!maxPrice}
          />
        </div>

        <div>
          <div className="mb-2 flex justify-between text-sm text-white">
            <span>Area Range (sqm)</span>
            <span className="text-orange-400">{sizeMax ? `${sizeMax} sqm` : "0 sqm"}</span>
          </div>
          <input
            type="range"
            min={0}
            max={maxSize || 0}
            step={10}
            value={sizeMax}
            onChange={(e) => setSizeMax(Number(e.target.value))}
            className="w-full accent-orange-500"
            disabled={!maxSize}
          />
        </div>
      </div>

      <div className="mt-10 text-center">
        <button
          onClick={runSearch}
          className="rounded-2xl bg-orange-500 px-10 py-4 text-sm font-semibold text-white shadow-lg hover:bg-orange-600"
        >
          Search Properties
        </button>
      </div>
    </div>
  );
}
