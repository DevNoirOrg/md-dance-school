import type { Metadata } from "next";
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
import { localizeNews, localizeRooms, localizeSettings, localizeTeachers } from "@/lib/localize";

export const metadata: Metadata = {
  title: "MD Dance School – Dance classes in Budapest",
  description: "Street dance classes in Budapest for children, teenagers and adults, from beginner to advanced.",
  alternates: { canonical: "/en", languages: { hu: "/", en: "/en" } },
};

export default async function EnglishHome() {
  const { settings: rawSettings, rooms: rawRooms, teachers: rawTeachers, news: rawNews } = await getSiteContent();
  const settings = localizeSettings(rawSettings, "en");
  const rooms = localizeRooms(rawRooms, "en");
  const teachers = localizeTeachers(rawTeachers, "en");
  const news = localizeNews(rawNews, "en");
  return (
    <main>
      <Navbar locale="en" />
      <Hero hero={settings.hero} locale="en" />
      <About about={settings.about} />
      <ClassSelectionProvider>
        <Orarend rooms={rooms} hint={settings.schedule.hint} locale="en" />
        <Teachers teachers={teachers} locale="en" />
        <Jelentkezes prices={settings.prices} options={settings.form_options} locale="en" />
        <SelectionDock locale="en" />
      </ClassSelectionProvider>
      <News title={settings.news.title} news={news} locale="en" />
      <Footer footer={settings.footer} locale="en" />
    </main>
  );
}
