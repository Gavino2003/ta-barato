const fs = require('fs')
const path = require('path')

/**
 * SCRAPER DE DEMONSTRAÇÃO
 *
 * Este script simula web scraping gerando preços com variações realistas.
 * Use isto para testar o sistema enquanto configura os scrapers reais.
 *
 * Para usar scrapers reais, edite config.js e scraper.js com URLs/seletores corretos.
 */

// Base de preços (médias de mercado)
const basePrices = {
  leite: { continente: 0.89, lidl: 0.79, auchan: 0.85 },
  arroz: { continente: 1.2, lidl: 0.99, auchan: 1.1 },
  ovos: { continente: 2.5, lidl: 2.2, auchan: 2.4 },
  azeite: { continente: 4.99, lidl: 4.49, auchan: 4.79 },
  massa: { continente: 0.69, lidl: 0.59, auchan: 0.65 },
  agua: { continente: 0.25, lidl: 0.19, auchan: 0.22 },
  cafe: { continente: 2.89, lidl: 2.49, auchan: 2.69 },
  acucar: { continente: 0.99, lidl: 0.85, auchan: 0.92 },
  farinha: { continente: 0.79, lidl: 0.65, auchan: 0.72 },
  manteiga: { continente: 1.99, lidl: 1.79, auchan: 1.89 }
}

// Simular variação de preços (-10% a +15%)
function simulatePrice(basePrice) {
  const variation = (Math.random() * 0.25) - 0.10 // -10% a +15%
  const newPrice = basePrice * (1 + variation)
  return Math.round(newPrice * 100) / 100 // Arredondar a 2 casas decimais
}

async function simulateScraping() {
  console.log('🕷️  Simulando web scraping...\n')
  console.log('ℹ️  Este é um scraper de DEMONSTRAÇÃO')
  console.log('ℹ️  Os preços são gerados com variações aleatórias\n')

  const results = {}

  for (const [product, stores] of Object.entries(basePrices)) {
    console.log(`📦 ${product.toUpperCase()}`)
    results[product] = {}

    for (const [store, basePrice] of Object.entries(stores)) {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 100))

      const price = simulatePrice(basePrice)
      results[product][store] = price

      console.log(`  ${store.padEnd(12)} → €${price.toFixed(2)}`)
    }
    console.log('')
  }

  // Guardar resultados
  const outputPath = path.join(__dirname, '../data/prices.json')
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2))

  console.log('✅ Scraping simulado completo!')
  console.log(`📄 Preços atualizados em: ${outputPath}\n`)

  // Mostrar comparação
  console.log('🏆 MAIS BARATOS POR PRODUTO:')
  for (const [product, stores] of Object.entries(results)) {
    const cheapest = Object.entries(stores).reduce((min, [store, price]) =>
      price < min.price ? { store, price } : min
    , { store: '', price: Infinity })

    console.log(`  ${product.padEnd(12)} → ${cheapest.store.toUpperCase()} (€${cheapest.price.toFixed(2)})`)
  }

  console.log('\n💡 Para usar preços reais:')
  console.log('   1. Configure os URLs em scrapers/config.js')
  console.log('   2. Ajuste os seletores CSS para cada site')
  console.log('   3. Execute: npm run scrape:real\n')
}

simulateScraping().catch(error => {
  console.error('❌ Erro:', error)
  process.exit(1)
})
