import { Space_Grotesk, Source_Sans_3 } from 'next/font/google'

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
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body
        style={{
          margin: 0,
          fontFamily: 'var(--font-body), sans-serif',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale'
        }}
      >
        {children}
      </body>
    </html>
  )
}
