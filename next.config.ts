import type { NextConfig } from "next";

// Stúdióbérlés (multi-zones): a /studio-berles alatti kéréseket a külön md-studio-rental app
// szolgálja ki, de a látogató és a Google a hiphoptanciskola.com/studio-berles címen marad
// (ez a kanonikus, jól rangsorolt cím). A bérlés app basePath-ja ugyanez: /studio-berles.
// Ugyanígy működnek a régi e-mailek jóváhagyó linkjei (/studio-berles/dontes?…) és a bérlés
// admin (/studio-berles/admin). STUDIO_RENTAL_ORIGIN: a bérlés app címe, pl. https://mddancestudio.com
const studioRentalOrigin = (process.env.STUDIO_RENTAL_ORIGIN || process.env.NEXT_PUBLIC_STUDIO_RENTAL_URL)?.replace(/\/+$/, "");

// Az adminban feltöltött képek a Supabase Storage-ból jönnek (next/image-nek engedélyezni kell a címet).
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : null;

// Ugyanaz a felépítés, mint az Under Cover oldalon: Turbopack + Tailwind 4 (PostCSS nélkül),
// Cache Components (a tartalom az adatbázisból jön, mentéskor frissül).
const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: supabaseHost ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }] : [],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    if (!studioRentalOrigin) return [];
    return [
      { source: "/studio-berles", destination: `${studioRentalOrigin}/studio-berles` },
      { source: "/studio-berles/:path+", destination: `${studioRentalOrigin}/studio-berles/:path+` },
    ];
  },
};

export default nextConfig;
