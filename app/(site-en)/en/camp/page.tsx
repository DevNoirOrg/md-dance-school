import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import TaborJelentkezes from "@/components/tanctabor/TaborJelentkezes";
import { TaborHero, TaborInfo, TaborTeachers } from "@/components/tanctabor/TaborSections";
import { getSiteContent } from "@/lib/content";
import { localizeSettings, localizeTeachers } from "@/lib/localize";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getSiteContent();
  const camp = localizeSettings(settings, "en").camp;
  return {
    title: `${camp.title.charAt(0)}${camp.title.slice(1).toLowerCase()} – MD Dance School`,
    description: `MD Dance School summer dance camp: ${camp.locationName}. Dance, wellness, sport and community. Prices, dates and sign-up.`,
    alternates: { canonical: "/en/camp", languages: { hu: "/tanctabor", en: "/en/camp" } },
  };
}

export default async function EnglishCampPage() {
  const { settings, teachers } = await getSiteContent();
  const localizedSettings = localizeSettings(settings, "en");
  return (
    <main className="bg-white">
      <Navbar locale="en" />
      <TaborHero camp={localizedSettings.camp} locale="en" />
      <TaborInfo camp={localizedSettings.camp} locale="en" />
      <TaborTeachers camp={localizedSettings.camp} teachers={localizeTeachers(teachers, "en")} locale="en" />
      <TaborJelentkezes camp={localizedSettings.camp} locale="en" />
      <Footer footer={localizedSettings.footer} locale="en" />
    </main>
  );
}
