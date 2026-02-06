import React from "react";
import { Helmet } from "react-helmet-async";

export default function Seo({
  title,
  description,
  pathname = "/",
  ogImage,
  noindex = false,
  jsonLd = null,
}) {
  const siteUrl = (import.meta.env.VITE_SITE_URL || "https://realviewgh.com").replace(/\/+$/, "");
  const url = siteUrl + pathname;

  const titleText = title ? `${title} | RealViewEstate` : "RealViewEstate - Land, Houses & Offices in Accra";
  const desc = description || "Buy or rent land, houses and offices across Accra. Trusted listings and fast support.";

  return (
    <Helmet>
      <title>{titleText}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={titleText} />
      <meta property="og:description" content={desc} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:url" content={url} />

      <meta name="twitter:card" content={ogImage ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={titleText} />
      <meta name="twitter:description" content={desc} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
