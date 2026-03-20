const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Configuração de produtos e URLs
const products = {
  leite: {
    continente: 'https://www.continente.pt/pesquisa/?q=leite%20mimosa',
    minipreco: 'https://www.minipreco.pt/pesquisa?q=leite',
    pingodoce: 'https://www.pingodoce.pt/home/produtos/lacteos/',
    lidl: 'https://www.lidl.pt/c/leite/c1064',
    auchan: 'https://www.auchan.pt/pt/pesquisa?text=leite'
  },
  arroz: {
    continente: 'https://www.continente.pt/pesquisa/?q=arroz',
    minipreco: 'https://www.minipreco.pt/pesquisa?q=arroz',
    pingodoce: 'https://www.pingodoce.pt/home/produtos/mercearia/',
    lidl: 'https://www.lidl.pt/c/arroz-massa-farinhas/c1011',
    auchan: 'https://www.auchan.pt/pt/pesquisa?text=arroz'
  },
  ovos: {
    continente: 'https://www.continente.pt/pesquisa/?q=ovos',
    minipreco: 'https://www.minipreco.pt/pesquisa?q=ovos',
    pingodoce: 'https://www.pingodoce.pt/home/produtos/lacteos/',
    lidl: 'https://www.lidl.pt/c/ovos/c1065',
    auchan: 'https://www.auchan.pt/pt/pesquisa?text=ovos'
  },
  azeite: {
    continente: 'https://www.continente.pt/pesquisa/?q=azeite',
    minipreco: 'https://www.minipreco.pt/pesquisa?q=azeite',
    pingodoce: 'https://www.pingodoce.pt/home/produtos/mercearia/',
    lidl: 'https://www.lidl.pt/c/azeite-vinagre/c1034',
    auchan: 'https://www.auchan.pt/pt/pesquisa?text=azeite'
  },
  massa: {
    continente: 'https://www.continente.pt/pesquisa/?q=massa',
    minipreco: 'https://www.minipreco.pt/pesquisa?q=massa',
    pingodoce: 'https://www.pingodoce.pt/home/produtos/mercearia/',
    lidl: 'https://www.lidl.pt/c/arroz-massa-farinhas/c1011',
    auchan: 'https://www.auchan.pt/pt/pesquisa?text=massa'
  }
}

// Seletores por loja
const selectors = {
  continente: ['.pwc-tile--price-primary'],
  minipreco: ['.price', '.product-price'],
  pingodoce: ['.sales-price', '.product-price', '[class*="price"]'],
  lidl: ['.pricebox__price', '.price', '[data-price]'],
  auchan: ['.product-tile__price', '.price', '[class*="price"]']
}

function extractPrice(text) {
  if (!text) return null
  const cleaned = text.replace(/\s/g, '').replace(/[^\d,€.]/g, '')
  const match = cleaned.match(/(\d+)[,.](\d+)/)
  if (match) {
    return parseFloat(`${match[1]}.${match[2]}`)
  }
  return null
}

async function scrapeStore(page, url, storeSelectors, storeName, productName) {
  try {
    console.log(`  → ${storeName}...`)

    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    })

    await sleep(3000)

    // Tentar cada seletor
    for (const selector of storeSelectors) {
      try {
        const element = await page.$(selector)
        if (element) {
          const text = await page.evaluate(el => el.textContent, element)
          const price = extractPrice(text)
          if (price && price > 0 && price < 100) {
            console.log(`    ✓ €${price.toFixed(2)}`)
            return price
          }
        }
      } catch (e) {
        // Continuar
      }
    }

    // Fallback: procurar qualquer texto com preço
    const priceFromPage = await page.evaluate(() => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            return node.textContent.match(/\d+[,\.]\d+\s*€/)
              ? NodeFilter.FILTER_ACCEPT
              : NodeFilter.FILTER_REJECT
          }
        }
      )

      if (walker.nextNode()) {
        return walker.currentNode.textContent.trim()
      }
      return null
    })

    if (priceFromPage) {
      const price = extractPrice(priceFromPage)
      if (price && price > 0 && price < 100) {
        console.log(`    ✓ €${price.toFixed(2)} (fallback)`)
        return price
      }
    }

    console.log(`    ✗ Não encontrado`)
    return null

  } catch (e) {
    console.log(`    ✗ Erro: ${e.message.substring(0, 50)}`)
    return null
  }
}

async function main() {
  console.log('🕷️  SCRAPING MULTI-SUPERMERCADOS\n')
  console.log('⏱️  Isto pode demorar 3-5 minutos...\n')

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')
  await page.setViewport({ width: 1920, height: 1080 })

  // Carregar preços anteriores
  const fallbackPath = path.join(__dirname, '../data/prices.json')
  let fallbackPrices = {}
  try {
    fallbackPrices = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'))
  } catch (e) {
    console.log('ℹ️  Sem preços anteriores, vai criar novos')
  }

  const results = {}
  const stores = ['continente', 'minipreco', 'pingodoce', 'lidl', 'auchan']

  for (const [productName, urls] of Object.entries(products)) {
    console.log(`\n📦 ${productName.toUpperCase()}`)
    results[productName] = {}

    for (const store of stores) {
      const url = urls[store]
      if (!url) continue

      const price = await scrapeStore(
        page,
        url,
        selectors[store],
        store.toUpperCase(),
        productName
      )

      results[productName][store] = price || fallbackPrices[productName]?.[store] || 0

      await sleep(1000) // Delay entre lojas
    }

    // Adicionar Mercadona e Intermarché (sem loja online - usar simulado)
    if (fallbackPrices[productName]?.mercadona) {
      results[productName].mercadona = fallbackPrices[productName].mercadona
    }
    if (fallbackPrices[productName]?.intermarche) {
      results[productName].intermarche = fallbackPrices[productName].intermarche
    }
  }

  await browser.close()

  // Adicionar produtos que faltam
  for (const [product, prices] of Object.entries(fallbackPrices)) {
    if (!results[product]) {
      results[product] = prices
    }
  }

  // Guardar
  fs.writeFileSync(fallbackPath, JSON.stringify(results, null, 2))

  console.log(`\n✅ Scraping completo!`)
  console.log(`📄 Preços guardados em: ${fallbackPath}\n`)

  // Resumo
  console.log('📊 Resumo por produto:')
  for (const [product, stores] of Object.entries(results)) {
    const validPrices = Object.entries(stores).filter(([_, p]) => p > 0)
    if (validPrices.length > 0) {
      const min = Math.min(...validPrices.map(([_, p]) => p))
      const cheapest = validPrices.find(([_, p]) => p === min)[0]
      console.log(`  ${product.padEnd(10)} → ${cheapest.toUpperCase().padEnd(12)} €${min.toFixed(2)}`)
    }
  }

  console.log(`\n📊 Preços obtidos por loja:`)
  const storeStats = {}
  for (const product of Object.values(results)) {
    for (const [store, price] of Object.entries(product)) {
      if (!storeStats[store]) storeStats[store] = 0
      if (price > 0) storeStats[store]++
    }
  }
  for (const [store, count] of Object.entries(storeStats)) {
    console.log(`  ${store.toUpperCase().padEnd(12)} → ${count}/${Object.keys(results).length} produtos`)
  }
}

main().catch(console.error)
