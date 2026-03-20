const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')
const config = require('./config')

// Helper para extrair preço de texto
function extractPrice(text) {
  if (!text) return null

  // Remove espaços e encontra padrão de preço (ex: 0,99 € ou €0.99)
  const cleaned = text.replace(/\s/g, '')
  const match = cleaned.match(/(\d+)[,.](\d+)/)

  if (match) {
    return parseFloat(`${match[1]}.${match[2]}`)
  }

  return null
}

// Scrape de uma página específica
async function scrapePage(page, url, selectors, storeName, productName) {
  try {
    console.log(`  → A verificar ${storeName}...`)

    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    })

    // Aguardar um pouco para JavaScript carregar
    await page.waitForTimeout(2000)

    // Tentar cada seletor
    for (const selector of selectors) {
      try {
        const element = await page.$(selector)
        if (element) {
          const text = await page.evaluate(el => el.textContent, element)
          const price = extractPrice(text)

          if (price) {
            console.log(`    ✓ Preço encontrado: €${price.toFixed(2)}`)
            return price
          }
        }
      } catch (e) {
        // Continuar para próximo seletor
      }
    }

    console.log(`    ⚠ Preço não encontrado com seletores configurados`)
    return null

  } catch (error) {
    console.log(`    ✗ Erro: ${error.message}`)
    return null
  }
}

// Função principal de scraping
async function scrapeAll() {
  console.log('🕷️  Iniciando web scraping...\n')

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()

  // User agent para parecer um browser normal
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

  const results = {}
  const products = config.products

  for (const [productName, stores] of Object.entries(products)) {
    console.log(`\n📦 ${productName.toUpperCase()}`)
    results[productName] = {}

    for (const [storeName, url] of Object.entries(stores)) {
      const price = await scrapePage(
        page,
        url,
        config.selectors[storeName],
        storeName,
        productName
      )

      if (price) {
        results[productName][storeName] = price
      } else {
        // Usar preço de fallback se scraping falhar
        const fallbackPrices = require('../data/prices.json')
        results[productName][storeName] = fallbackPrices[productName]?.[storeName] || 0
        console.log(`    ℹ️  A usar preço anterior: €${results[productName][storeName].toFixed(2)}`)
      }
    }
  }

  await browser.close()

  // Guardar resultados
  const outputPath = path.join(__dirname, '../data/prices.json')
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2))

  console.log(`\n✅ Scraping completo!`)
  console.log(`📄 Preços guardados em: ${outputPath}\n`)

  // Mostrar resumo
  console.log('📊 Resumo:')
  for (const [product, stores] of Object.entries(results)) {
    const prices = Object.values(stores)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    console.log(`  ${product}: €${min.toFixed(2)} - €${max.toFixed(2)}`)
  }
}

// Executar
scrapeAll().catch(error => {
  console.error('❌ Erro fatal:', error)
  process.exit(1)
})
