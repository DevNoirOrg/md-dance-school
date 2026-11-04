import type { Metadata } from "next";
import { fontVariables } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: { default: "MD Dance School – Dance classes in Budapest", template: "%s – MD Dance School" },
  description: "Street dance classes in Budapest for children, teenagers and adults, from beginner to advanced.",
  alternates: { languages: { hu: "/", en: "/en" } },
};

export default function EnglishSiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
