import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import TaborJelentkezes from "@/components/tanctabor/TaborJelentkezes";
import { TaborHero, TaborInfo, TaborTeachers } from "@/components/tanctabor/TaborSections";
import { getSiteContent } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getSiteContent();
  const camp = settings.camp;
  return {
    title: `${camp.title.charAt(0)}${camp.title.slice(1).toLowerCase()} – MD Dance School`,
    description: `MD nyári tánctábor: ${camp.locationName}. Tánc, wellness, sport és közösség. Árak, időpontok, jelentkezés.`,
  };
}

export default async function TanctaborPage() {
  const { settings, teachers } = await getSiteContent();
  return (
    <main className="bg-white">
      <Navbar />
      <TaborHero camp={settings.camp} />
      <TaborInfo camp={settings.camp} />
      <TaborTeachers camp={settings.camp} teachers={teachers} />
      <TaborJelentkezes camp={settings.camp} />
      <Footer footer={settings.footer} />
    </main>
  );
}
