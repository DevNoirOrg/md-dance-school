import type { Metadata } from "next";
import { fontVariables } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "MD Dance School – Master Dance Tánciskola Budapest",
  description:
    "MD Dance School – a Master Dance tánciskola Budapesten. Hip-hop és egyéb táncstílusok gyerekeknek, tizenéveseknek és felnőtteknek, kezdőtől haladóig.",
};

/* A publikus oldal gyökér-layoutja (az admin felületnek saját layoutja van). */
export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hu" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
