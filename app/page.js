import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Orarend from '@/components/Orarend'
import Teachers from '@/components/Teachers'
import Jelentkezes from '@/components/Jelentkezes'
import News from '@/components/News'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <About />
      <Orarend />
      <Teachers />
      <Jelentkezes />
      <News />
      <Footer />
    </main>
  )
}
