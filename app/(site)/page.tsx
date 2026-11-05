import About from "@/components/About";
import { ClassSelectionProvider, SelectionDock } from "@/components/ClassSelection";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Jelentkezes from "@/components/Jelentkezes";
import Navbar from "@/components/Navbar";
import News from "@/components/News";
import Orarend from "@/components/Orarend";
import Teachers from "@/components/Teachers";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "MD Dance School – Master Dance Tánciskola Budapest",
  description: "MD Dance School – a Master Dance tánciskola Budapesten. Hip-hop és egyéb táncstílusok gyerekeknek, tizenéveseknek és felnőtteknek, kezdőtől haladóig.",
  alternates: { canonical: "/", languages: { hu: "/", en: "/en" } },
};

export default async function Home() {
  const { settings, rooms, teachers, news } = await getSiteContent();
  return (
    <main>
      <Navbar />
      <Hero hero={settings.hero} />
      <About about={settings.about} />
      {/* Az órarendben kiválasztott órák a jelentkezési űrlapba kerülnek */}
      <ClassSelectionProvider>
        <Orarend rooms={rooms} hint={settings.schedule.hint} />
        <Teachers teachers={teachers} />
        <Jelentkezes prices={settings.prices} options={settings.form_options} />
        <SelectionDock />
      </ClassSelectionProvider>
      <News title={settings.news.title} news={news} />
      <Footer footer={settings.footer} />
    </main>
  );
}
import type { Metadata } from "next";
