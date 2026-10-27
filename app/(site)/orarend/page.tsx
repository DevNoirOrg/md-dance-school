import type { Metadata } from "next";
import { ClassSelectionProvider, SelectionDock } from "@/components/ClassSelection";
import Footer from "@/components/Footer";
import Jelentkezes from "@/components/Jelentkezes";
import Navbar from "@/components/Navbar";
import Orarend from "@/components/Orarend";
import PageHero from "@/components/PageHero";
import Tanfolyamok from "@/components/Tanfolyamok";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Órarend és tanfolyamok – MD Dance School",
  description:
    "Az MD Dance School órarendje, tanfolyamai és árai: hip-hop, koreográfia, girly, high heels és house, kezdőtől haladóig. Jelentkezz online!",
};

// Az órarend és a jelentkezés UGYANAZ a komponens, mint a főoldalon.
export default async function OrarendPage() {
  const { settings, rooms } = await getSiteContent();
  return (
    <main className="bg-white">
      <Navbar />
      <PageHero title={settings.courses.heroTitle} lead={settings.courses.heroLead} image="/canva/hero-crowd.jpg" position="center 55%" />
      <ClassSelectionProvider>
        <Orarend rooms={rooms} hint={settings.schedule.hint} />
        <Tanfolyamok courses={settings.courses} />
        <Jelentkezes prices={settings.prices} options={settings.form_options} />
        <SelectionDock />
      </ClassSelectionProvider>
      <Footer footer={settings.footer} />
    </main>
  );
}
