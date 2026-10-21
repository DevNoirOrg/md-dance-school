import Navbar from '@/components/Navbar'
import Orarend from '@/components/Orarend'
import Tanfolyamok, { OrarendHero } from '@/components/Tanfolyamok'
import Jelentkezes from '@/components/Jelentkezes'
import Footer from '@/components/Footer'
import { ClassSelectionProvider, SelectionDock } from '@/components/ClassSelection'

export const metadata = {
  title: 'Órarend és tanfolyamok – MD Dance School',
  description:
    'Az MD Dance School órarendje, tanfolyamai és árai: hip-hop, koreográfia, girly, high heels és house, kezdőtől haladóig. Jelentkezz online!',
}

// Az órarend és a jelentkezés UGYANAZ a komponens, mint a főoldalon.
export default function OrarendPage() {
  return (
    <main className="bg-white">
      <Navbar />
      <OrarendHero />
      <ClassSelectionProvider>
        <Orarend />
        <Tanfolyamok />
        <Jelentkezes />
        <SelectionDock />
      </ClassSelectionProvider>
      <Footer />
    </main>
  )
}
