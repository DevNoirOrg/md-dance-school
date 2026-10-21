import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { TaborHero, TaborInfo, TaborTeachers } from '@/components/tanctabor/TaborSections'
import TaborJelentkezes from '@/components/tanctabor/TaborJelentkezes'

export const metadata = {
  title: 'Tánctábor 2026 – MD Dance School',
  description:
    'MD nyári tánctábor 2026 a Szigetszentmiklósi Oázis Wellness Parkban: 4 nap tánc, wellness, sport és közösség. Árak, időpontok, jelentkezés.',
}

export default function TanctaborPage() {
  return (
    <main className="bg-white">
      <Navbar />
      <TaborHero />
      <TaborInfo />
      <TaborTeachers />
      <TaborJelentkezes />
      <Footer />
    </main>
  )
}
