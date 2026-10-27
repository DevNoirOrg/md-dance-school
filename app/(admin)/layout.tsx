import type { Metadata } from "next";
import { fontVariables } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: { default: "Admin — MD Dance School", template: "%s — MD Dance School admin" },
  robots: { index: false, follow: false, nocache: true },
};

/* Az admin felület saját gyökér-layoutja (a publikus oldaltól független). */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hu" className={fontVariables}>
      <body className="min-h-screen bg-mist font-sans text-ink antialiased selection:bg-md-cyan selection:text-ink">{children}</body>
    </html>
  );
}
