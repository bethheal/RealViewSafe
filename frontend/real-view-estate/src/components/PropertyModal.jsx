import React, { useEffect, useMemo, useState } from "react";

import Seo from "./Seo";
import { extractMediaUrls, formatGhs, isVideoUrl, pickPrimaryImageUrl } from "../lib/media";
import { REALVIEW_CONTACT } from "../constants/realviewContact";
import { useAuth } from "../context/AuthContext";

const cleanPhone = (phone) => String(phone || "").replace(/\D/g, "");
const placeholderImage = "https://via.placeholder.com/1200x800?text=Property";

export default function PropertyModal({ property, onClose }) {
  const { user } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);

  const mediaItems = useMemo(() => {
    if (!property) return [];
    const urls = extractMediaUrls(property);
    return urls.map((url) => ({
      url,
      type: isVideoUrl(url) ? "video" : "image",
    }));
  }, [property]);

  useEffect(() => {
    if (!property) return;
    setActiveIndex(0);
  }, [property?.id]);

  if (!property) return null;

  const imageUrl = pickPrimaryImageUrl(property, placeholderImage);
  const galleryItems =
    mediaItems.length > 0
      ? mediaItems
      : [{ url: imageUrl || placeholderImage, type: "image" }];

  const safeIndex = Math.min(activeIndex, Math.max(galleryItems.length - 1, 0));
  const activeItem = galleryItems[safeIndex] || {
    url: imageUrl || placeholderImage,
    type: "image",
  };

  const isAdminListing = Boolean(property?.listedByAdmin);
  const agentPhone = property?.agent?.user?.phone || "";
  const isRealViewContact = isAdminListing;
  const contactPhone = isRealViewContact ? REALVIEW_CONTACT.phone : agentPhone;
  const canShowContact = Boolean(user);
  const hasContactPhone = Boolean(cleanPhone(contactPhone));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={() => onClose?.()}
    >
      <Seo
        title={`${property.title} - RealViewEstate`}
        description={property.description || `${property.title} located in ${property.location}.`}
        pathname={`/properties/${property.id}`}
        ogImage={imageUrl}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Offer",
          price: property.price ? String(property.price) : undefined,
          priceCurrency: "GHS",
          url:
            (import.meta.env.VITE_SITE_URL || "https://realviewgh.com") +
            `/properties/${property.id}`,
          itemOffered: {
            "@type": "Product",
            name: property.title,
            description: property.description || "Property listing",
            image: imageUrl,
          },
        }}
      />
      <div
        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between border-b px-6 py-4">
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

        <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border bg-gray-50">
              {activeItem.type === "video" ? (
                <video
                  controls
                  preload="metadata"
                  className="h-80 w-full object-cover"
                  src={activeItem.url}
                />
              ) : (
                <img
                  src={activeItem.url}
                  alt={property.title}
                  className="h-80 w-full object-cover"
                />
              )}
            </div>

            {galleryItems.length > 1 ? (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {galleryItems.map((item, idx) => {
                  const isActive = idx === safeIndex;
                  return (
                    <button
                      key={`${item.url}-${idx}`}
                      type="button"
                      onClick={() => setActiveIndex(idx)}
                      className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border ${
                        isActive
                          ? "border-[#8B6F2F] ring-2 ring-[#8B6F2F]/40"
                          : "border-gray-200"
                      }`}
                      aria-label={`Preview ${item.type} ${idx + 1}`}
                    >
                      {item.type === "video" ? (
                        <video
                          src={item.url}
                          muted
                          preload="metadata"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <img
                          src={item.url}
                          alt={`${property.title} preview ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      )}
                      {item.type === "video" ? (
                        <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                          Video
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="space-y-5">
            <p className="text-2xl font-bold text-[#8B6F2F]">{formatGhs(property.price)}</p>

            <div>
              <div className="text-sm font-bold text-gray-700">Description</div>
              <p className="mt-2 text-sm text-gray-600">
                {property.description || "No description provided."}
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 p-4">
              <div className="text-sm font-bold text-gray-700">Reach out to agent</div>
              {!canShowContact ? (
                <div className="mt-2 space-y-3">
                  <p className="text-sm text-gray-600 font-semibold">
                    Log in or sign up to reach the agent and view contact details.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href="/login"
                      className="rounded-xl bg-[#8B6F2F] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7a6128]"
                    >
                      Reach out
                    </a>
                    <a
                      href="/signup"
                      className="rounded-xl border border-[#8B6F2F] px-4 py-2 text-sm font-semibold text-[#8B6F2F] hover:bg-[#f7f2e8]"
                    >
                      Sign up
                    </a>
                  </div>
                </div>
              ) : hasContactPhone ? (
                <div className="mt-2 text-sm text-gray-700 font-semibold">
                  <div>{isRealViewContact ? "Real View Contact" : "Agent Contact"}</div>
                  <div className="text-[#8B6F2F]">{contactPhone}</div>
                  {isRealViewContact ? (
                    <div className="text-xs text-gray-500">{REALVIEW_CONTACT.email}</div>
                  ) : null}
                </div>
              ) : (
                <p className="mt-2 text-sm text-red-600 font-semibold">
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
