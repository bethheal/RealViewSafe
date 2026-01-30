import React from "react";

import { formatGhs, resolveMediaUrl } from "../lib/media";
import { REALVIEW_CONTACT } from "../constants/realviewContact";
import { useAuth } from "../context/AuthContext";

const cleanPhone = (phone) => String(phone || "").replace(/\D/g, "");

export default function PropertyModal({ property, onClose }) {
  const { user } = useAuth();
  if (!property) return null;

  const firstImage = Array.isArray(property?.images) ? property.images[0] : null;
  const rawImage =
    (typeof firstImage === "string" ? firstImage : firstImage?.url) ||
    property?.image ||
    "";
  const imageUrl =
    resolveMediaUrl(rawImage) || "https://via.placeholder.com/1200x800?text=Property";

  const isAdminListing = Boolean(property?.listedByAdmin);
  const agentPhone = property?.agent?.user?.phone || "";
  const isRealViewContact = isAdminListing;
  const contactPhone = isRealViewContact ? REALVIEW_CONTACT.phone : agentPhone;
  const canShowContact = Boolean(user);
  const hasContactPhone = Boolean(cleanPhone(contactPhone));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <img
          src={imageUrl}
          alt={property.title}
          className="h-72 w-full object-cover"
        />

        <div className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">{property.title}</h2>
              <p className="text-gray-500">Location: {property.location}</p>
            </div>

            <button
              onClick={onClose}
              className="text-xl text-gray-400 hover:text-gray-700"
              aria-label="Close"
            >
              X
            </button>
          </div>

          <p className="mb-6 text-gray-600">{property.description || "No description provided."}</p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-2xl font-bold text-[#8B6F2F]">
              {formatGhs(property.price)}
            </p>

            <div className="flex flex-col items-start gap-2 sm:items-end">
              {!canShowContact ? (
                <>
                  <p className="text-sm text-gray-600 font-semibold">
                    Please log in or sign up to view contact details.
                  </p>
                  <div className="flex gap-2">
                    <a
                      href="/login"
                      className="rounded-xl bg-[#8B6F2F] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7a6128]"
                    >
                      Login
                    </a>
                    <a
                      href="/signup"
                      className="rounded-xl border border-[#8B6F2F] px-4 py-2 text-sm font-semibold text-[#8B6F2F] hover:bg-[#f7f2e8]"
                    >
                      Sign up
                    </a>
                  </div>
                </>
              ) : hasContactPhone ? (
                <div className="text-sm text-gray-700 font-semibold text-right">
                  <div>{isRealViewContact ? "Real View Contact" : "Agent Contact"}</div>
                  <div className="text-[#8B6F2F]">{contactPhone}</div>
                  {isRealViewContact && (
                    <div className="text-xs text-gray-500">{REALVIEW_CONTACT.email}</div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-red-600 font-semibold">
                  Agent phone not available yet. Please check back later.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
