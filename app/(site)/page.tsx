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

export default async function Home() {
  const { settings, rooms, teachers } = await getSiteContent();
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
      <News news={settings.news} />
      <Footer footer={settings.footer} />
    </main>
  );
}
