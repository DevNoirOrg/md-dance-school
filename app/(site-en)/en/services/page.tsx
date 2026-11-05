import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { CompanyPreview, SzolgaltatasokHero } from "@/components/Szolgaltatasok";
import { getSiteContent } from "@/lib/content";
import { localizeSettings } from "@/lib/localize";

export const metadata: Metadata = {
  title: "Services",
  description: "Dance shows, choreography and productions for events, stages and camera.",
  alternates: { canonical: "/en/services", languages: { hu: "/szolgaltatasok", en: "/en/services" } },
};

export default async function EnglishServices() {
  const { settings: raw } = await getSiteContent();
  const settings = localizeSettings(raw, "en");
  return (
    <main className="bg-white">
      <Navbar locale="en" />
      <SzolgaltatasokHero services={settings.services} locale="en" />
      <CompanyPreview services={settings.services} locale="en" />
      <Footer footer={settings.footer} locale="en" />
    </main>
  );
}
