// Public URL for share links, canonical tags and link previews. On Vercel it falls back to the
// project's own address, so a fresh deploy needs no settings.
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (vercelHost ? `https://${vercelHost}` : "http://localhost:3000");
// The demo shows placeholder prices and contact details under AKKI's name, so it stays out of
// search results until SITE_INDEXABLE=true is set for the real launch.
const indexable = process.env.SITE_INDEXABLE === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: { AKKI_SITE_URL: siteUrl },
  reactStrictMode: true,
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"] },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
          ...(indexable ? [] : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]),
        ],
      },
    ];
  },
};
export default nextConfig;
