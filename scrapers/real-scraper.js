const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// URLs de pesquisa para cada produto
const searchURLs = {
  leite: {
    continente: 'https://www.continente.pt/pesquisa/?q=leite%20mimosa',
    lidl: 'https://www.lidl.pt/c/leite/c1064',
    auchan: 'https://www.auchan.pt/pt/search?text=leite'
  },
  arroz: {
    continente: 'https://www.continente.pt/pesquisa/?q=arroz%20agulha',
    lidl: 'https://www.lidl.pt/c/arroz-massa-farinhas/c1011',
    auchan: 'https://www.auchan.pt/pt/search?text=arroz'
  },
  ovos: {
    continente: 'https://www.continente.pt/pesquisa/?q=ovos',
    lidl: 'https://www.lidl.pt/c/ovos/c1065',
    auchan: 'https://www.auchan.pt/pt/search?text=ovos'
  },
  azeite: {
    continente: 'https://www.continente.pt/pesquisa/?q=azeite',
    lidl: 'https://www.lidl.pt/c/azeite-vinagre/c1034',
    auchan: 'https://www.auchan.pt/pt/search?text=azeite'
  },
  massa: {
    continente: 'https://www.continente.pt/pesquisa/?q=massa%20esparguete',
    lidl: 'https://www.lidl.pt/c/arroz-massa-farinhas/c1011',
    auchan: 'https://www.auchan.pt/pt/search?text=massa'
  },
  agua: {
    continente: 'https://www.continente.pt/pesquisa/?q=agua%20natural',
    lidl: 'https://www.lidl.pt/c/agua/c1025',
    auchan: 'https://www.auchan.pt/pt/search?text=agua'
  },
  cafe: {
    continente: 'https://www.continente.pt/pesquisa/?q=cafe%20delta',
    lidl: 'https://www.lidl.pt/c/cafe-cha-e-substitutos/c1009',
    auchan: 'https://www.auchan.pt/pt/search?text=cafe'
  },
  acucar: {
    continente: 'https://www.continente.pt/pesquisa/?q=acucar%20branco',
    lidl: 'https://www.lidl.pt/c/acucar-adocantes-substitutos/c1016',
    auchan: 'https://www.auchan.pt/pt/search?text=acucar'
  },
  farinha: {
    continente: 'https://www.continente.pt/pesquisa/?q=farinha%20tipo%2065',
    lidl: 'https://www.lidl.pt/c/arroz-massa-farinhas/c1011',
    auchan: 'https://www.auchan.pt/pt/search?text=farinha'
  },
  manteiga: {
    continente: 'https://www.continente.pt/pesquisa/?q=manteiga',
    lidl: 'https://www.lidl.pt/c/manteiga-e-margarinas/c1058',
    auchan: 'https://www.auchan.pt/pt/search?text=manteiga'
  }
}

// Seletores para extrair preço
const selectors = {
  continente: '.pwc-tile--price-primary',
  lidl: ['.pricebox__price', '.price', '[data-price]'],
  auchan: ['.product-price', '.price-tag', '[class*="price"]']
}

// Extrai preço de texto
function extractPrice(text) {
  if (!text) return null
  const cleaned = text.replace(/\s/g, '')
  const match = cleaned.match(/(\d+)[,.](\d+)/)
  if (match) {
    return parseFloat(`${match[1]}.${match[2]}`)
  }
  return null
}

// Scrape Continente
async function scrapeContinente(page, url, productName) {
  try {
    console.log(`  → Continente...`)
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
    await sleep(2000)

    const element = await page.$(selectors.continente)
    if (element) {
      const text = await page.evaluate(el => el.textContent, element)
      const price = extractPrice(text)
      if (price) {
        console.log(`    ✓ €${price.toFixed(2)}`)
        return price
      }
    }
  } catch (e) {
    console.log(`    ✗ Erro: ${e.message}`)
  }
  return null
}

// Scrape Lidl
async function scrapeLidl(page, url, productName) {
  try {
    console.log(`  → Lidl...`)
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
    await sleep(3000)

    for (const selector of selectors.lidl) {
      const element = await page.$(selector)
      if (element) {
        const text = await page.evaluate(el => el.textContent, element)
        const price = extractPrice(text)
        if (price) {
          console.log(`    ✓ €${price.toFixed(2)}`)
          return price
        }
      }
    }
  } catch (e) {
    console.log(`    ✗ Erro: ${e.message}`)
  }
  return null
}

// Scrape Auchan
async function scrapeAuchan(page, url, productName) {
  try {
    console.log(`  → Auchan...`)
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
    await sleep(3000)

    for (const selector of selectors.auchan) {
      const element = await page.$(selector)
      if (element) {
        const text = await page.evaluate(el => el.textContent, element)
        const price = extractPrice(text)
        if (price) {
          console.log(`    ✓ €${price.toFixed(2)}`)
          return price
        }
      }
    }
  } catch (e) {
    console.log(`    ✗ Erro: ${e.message}`)
  }
  return null
}

// Main scraper
async function scrapeAll() {
  console.log('🕷️  Iniciando web scraping REAL...\n')
  console.log('⏱️  Isto pode demorar 1-2 minutos...\n')

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')

  // Carregar preços antigos como fallback
  const fallbackPrices = require('../data/prices.json')
  const results = {}

  for (const [productName, urls] of Object.entries(searchURLs)) {
    console.log(`📦 ${productName.toUpperCase()}`)
    results[productName] = {}

    // Continente
    const continentePrice = await scrapeContinente(page, urls.continente, productName)
    results[productName].continente = continentePrice || fallbackPrices[productName]?.continente || 0

    // Lidl
    const lidlPrice = await scrapeLidl(page, urls.lidl, productName)
    results[productName].lidl = lidlPrice || fallbackPrices[productName]?.lidl || 0

    // Auchan
    const auchanPrice = await scrapeAuchan(page, urls.auchan, productName)
    results[productName].auchan = auchanPrice || fallbackPrices[productName]?.auchan || 0

    console.log('')
  }

  await browser.close()

  // Adicionar produtos que faltam com preços antigos
  for (const [product, prices] of Object.entries(fallbackPrices)) {
    if (!results[product]) {
      results[product] = prices
      console.log(`ℹ️  ${product}: Usando preços anteriores (não fez scraping)`)
    }
  }

  // Guardar
  const outputPath = path.join(__dirname, '../data/prices.json')
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2))

  console.log(`\n✅ Scraping completo!`)
  console.log(`📄 Preços guardados em: ${outputPath}\n`)

  // Resumo
  console.log('📊 Resumo:')
  for (const [product, stores] of Object.entries(results)) {
    const prices = Object.values(stores)
    const min = Math.min(...prices)
    const cheapest = Object.entries(stores).find(([_, p]) => p === min)[0]
    console.log(`  ${product}: ${cheapest.toUpperCase()} €${min.toFixed(2)}`)
  }
}

scrapeAll().catch(error => {
  console.error('❌ Erro fatal:', error)
  process.exit(1)
})
