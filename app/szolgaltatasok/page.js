import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { SzolgaltatasokHero, CompanyPreview } from '@/components/Szolgaltatasok'

export const metadata = {
  title: 'Szolgáltatások – MD Dance School',
  description:
    'Show, koreográfia és produkció rendezvényekre, színpadra és kamera elé — az MD Dance Company szolgáltatásai.',
}

export default function SzolgaltatasokPage() {
  return (
    <main className="bg-white">
      <Navbar />
      <SzolgaltatasokHero />
      <CompanyPreview />
      <Footer />
    </main>
  )
}
