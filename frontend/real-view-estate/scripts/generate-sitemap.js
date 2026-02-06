import fs from "fs";
import path from "path";

const siteUrl = process.env.FRONTEND_URL || "https://realviewgh.com";

const pages = [
  { url: "/", priority: 1.0 },
  { url: "/properties", priority: 0.9 },
  { url: "/properties/for-sale", priority: 0.8 },
  { url: "/properties/for-rent", priority: 0.8 },
  { url: "/about", priority: 0.6 },
  { url: "/contact", priority: 0.6 },
  { url: "/agents", priority: 0.6 },
  { url: "/faq", priority: 0.5 },
  { url: "/terms", priority: 0.3 },
  { url: "/privacy", priority: 0.3 },
];

const urls = pages
  .map((p) => {
    return `<url><loc>${siteUrl}${p.url}</loc><changefreq>weekly</changefreq><priority>${p.priority}</priority></url>`;
  })
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

const out = path.join(process.cwd(), "public", "sitemap.xml");

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, xml, "utf8");
console.log(`Wrote sitemap to ${out}`);
