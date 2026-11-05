import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { CompanyPreview, SzolgaltatasokHero } from "@/components/Szolgaltatasok";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Szolgáltatások – MD Dance School",
  description: "Show, koreográfia és produkció rendezvényekre, színpadra és kamera elé — az MD Dance Company szolgáltatásai.",
  alternates: { canonical: "/szolgaltatasok", languages: { hu: "/szolgaltatasok", en: "/en/services" } },
};

export default async function SzolgaltatasokPage() {
  const { settings } = await getSiteContent();
  return (
    <main className="bg-white">
      <Navbar />
      <SzolgaltatasokHero services={settings.services} />
      <CompanyPreview services={settings.services} />
      <Footer footer={settings.footer} />
    </main>
  );
}
