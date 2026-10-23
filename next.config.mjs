// A stúdióbérlés külön oldalra költözött (md-studio-rental). A régi címek — köztük a korábban
// kiküldött e-mailek jóváhagyó linkjei (/studio-berles/dontes?token=…) — oda irányítanak át;
// a query string (token, action, slot) automatikusan megmarad.
const studioRentalUrl = process.env.NEXT_PUBLIC_STUDIO_RENTAL_URL?.replace(/\/+$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  async redirects() {
    if (!studioRentalUrl) return [];
    return [
      { source: "/studio-berles/dontes", destination: `${studioRentalUrl}/dontes`, permanent: false },
      { source: "/studio-berles", destination: studioRentalUrl, permanent: false },
      { source: "/admin", destination: `${studioRentalUrl}/admin`, permanent: false },
    ];
  },
};
export default nextConfig;
