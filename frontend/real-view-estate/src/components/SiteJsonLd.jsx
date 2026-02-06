import React from "react";
import { Helmet } from "react-helmet-async";
import { REALVIEW_CONTACT } from "../constants/realviewContact";

export default function SiteJsonLd() {
  const siteUrl = (import.meta.env.VITE_SITE_URL || "https://realviewgh.com").replace(/\/+$/, "");

  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: REALVIEW_CONTACT.name,
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: REALVIEW_CONTACT.phone,
        contactType: "customer service",
        email: REALVIEW_CONTACT.email,
      },
    ],
  };

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: REALVIEW_CONTACT.name,
    url: siteUrl,
    telephone: REALVIEW_CONTACT.phone,
    email: REALVIEW_CONTACT.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: REALVIEW_CONTACT.address,
      addressLocality: "Accra",
      addressCountry: "GH",
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(org)}</script>
      <script type="application/ld+json">{JSON.stringify(localBusiness)}</script>
    </Helmet>
  );
}
