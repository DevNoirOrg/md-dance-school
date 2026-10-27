import type { SocialLink } from "@/lib/content-types";

/*
  Közösségi ikonok saját SVG-vel — a lucide-react 1.x-ből a márkaikonok
  (Instagram, Facebook, YouTube) kikerültek. Egyszerű, egyszínű vonalikonok.
*/
const paths: Record<SocialLink["label"], React.ReactNode> = {
  Instagram: (
    <>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  Facebook: <path d="M14.5 21v-7.5h2.6l.4-3H14.5V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8.9v3h2.6V21" />,
  YouTube: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="4" />
      <path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor" />
    </>
  ),
  TikTok: <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.4 2.4 2 4 4.5 4.3" />,
};

export function SocialIcon({ label, size = 22 }: { label: SocialLink["label"]; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[label]}
    </svg>
  );
}
