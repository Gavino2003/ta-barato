export const metadata = {
  title: 'TáBarato - O teu comparador de preços tuga',
  description: 'Encontra os produtos mais baratos entre Continente, Pingo Doce e Minipreço. Comparação inteligente com web scraping real!',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  )
}
