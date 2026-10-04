import './globals.css'
import { Anton, Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
})

const anton = Anton({
  subsets: ['latin', 'latin-ext'],
  weight: '400',
  display: 'swap',
  variable: '--font-anton',
})

export const metadata = {
  title: 'MD Dance School – Master Dance Tánciskola Budapest',
  description: 'MD Dance School – a Master Dance tánciskola Budapesten. Hip-hop és egyéb táncstílusok gyerekeknek, tizenéveseknek és felnőtteknek, kezdőtől haladóig.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="hu" className={`${inter.variable} ${anton.variable}`}>
      <body>{children}</body>
    </html>
  )
}
