export const metadata = {
  title: 'Comparador de Preços',
  description: 'Compare preços entre Continente, Lidl e Auchan',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  )
}
