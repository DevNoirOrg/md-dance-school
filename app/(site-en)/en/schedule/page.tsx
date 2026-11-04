import type { Metadata } from "next";
import { ClassSelectionProvider, SelectionDock } from "@/components/ClassSelection";
import Footer from "@/components/Footer";
import Jelentkezes from "@/components/Jelentkezes";
import Navbar from "@/components/Navbar";
import Orarend from "@/components/Orarend";
import PageHero from "@/components/PageHero";
import Tanfolyamok from "@/components/Tanfolyamok";
import { getSiteContent } from "@/lib/content";
import { localizeRooms, localizeSettings } from "@/lib/localize";

export const metadata: Metadata = {
  title: "Schedule and classes",
  description: "Explore MD Dance School's schedule, classes and prices in Budapest.",
  alternates: { canonical: "/en/schedule", languages: { hu: "/orarend", en: "/en/schedule" } },
};

export default async function EnglishSchedule() {
  const { settings: raw, rooms: rawRooms } = await getSiteContent();
  const settings = localizeSettings(raw, "en");
  const rooms = localizeRooms(rawRooms, "en");
  return (
    <main className="bg-white">
      <Navbar locale="en" />
      <PageHero title={settings.courses.heroTitle} lead={settings.courses.heroLead} image="/canva/hero-crowd.jpg" position="center 55%" />
      <ClassSelectionProvider>
        <Orarend rooms={rooms} hint={settings.schedule.hint} locale="en" />
        <Tanfolyamok courses={settings.courses} locale="en" />
        <Jelentkezes prices={settings.prices} options={settings.form_options} locale="en" />
        <SelectionDock locale="en" />
      </ClassSelectionProvider>
      <Footer footer={settings.footer} locale="en" />
    </main>
  );
}
