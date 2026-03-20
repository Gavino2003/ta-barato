import { Space_Grotesk, Source_Sans_3 } from 'next/font/google'
import './globals.css'

const headingFont = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading'
})

const bodyFont = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-body'
})

export const metadata = {
  title: 'TáBarato - O teu comparador de preços tuga',
  description: 'Encontra os produtos mais baratos entre Continente, Pingo Doce e Minipreço. Comparação inteligente com web scraping real!',
  icons: {
    icon: '/favicon.ico',
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body className="antialiased [font-family:var(--font-body)]">
        {children}
      </body>
    </html>
  )
}
