import { siteUrl } from "./site-url";

/** Az admin felület gyökércíme (e-mailekben lévő linkekhez). */
export function adminBaseUrl(): string {
  const host = process.env.ADMIN_HOST;
  if (host) return `https://${host}/admin`;
  return new URL("/admin", siteUrl).toString();
}
