const puppeteer = require('puppeteer')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const stores = {
  pingodoce: {
    name: 'Pingo Doce',
    url: 'https://www.pingodoce.pt/pesquisa/?text=leite',
    priceSelectors: ['.product-price', '.price', '[data-price]', '[class*="price"]']
  },
  mercadona: {
    name: 'Mercadona',
    url: 'https://www.mercadona.pt',
    priceSelectors: ['.product-price', '.price', '[data-price]']
  },
  intermarche: {
    name: 'Intermarché',
    url: 'https://www.intermarche.pt',
    priceSelectors: ['.product-price', '.price']
  },
  minipreco: {
    name: 'Minipreço',
    url: 'https://www.minipreco.pt',
    priceSelectors: ['.product-price', '.price']
  }
}

async function investigateStore(page, storeKey, storeData) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`📦 ${storeData.name.toUpperCase()}`)
  console.log('='.repeat(60))

  try {
    console.log(`🌐 Navegando para: ${storeData.url}`)

    await page.goto(storeData.url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    })

    await sleep(3000)

    console.log(`✅ Página carregada!`)
    console.log(`📄 Título: ${await page.title()}`)

    // Verificar se tem pesquisa
    const hasSearch = await page.$('input[type="search"], input[placeholder*="procura"], input[name*="search"]')
    console.log(`🔍 Campo de pesquisa: ${hasSearch ? 'SIM ✓' : 'NÃO ✗'}`)

    // Tentar encontrar preços
    console.log(`\n💰 Procurando preços:`)
    for (const selector of storeData.priceSelectors) {
      try {
        const elements = await page.$$(selector)
        if (elements.length > 0) {
          const firstText = await page.evaluate(el => el?.textContent, elements[0])
          console.log(`  ✓ "${selector}": ${elements.length} encontrados - Ex: "${firstText?.trim().substring(0, 30)}"`)
        }
      } catch (e) {
        // Silenciar
      }
    }

    // Procurar todos os elementos com € ou preço
    const priceElements = await page.evaluate(() => {
      const results = []
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            return node.textContent.match(/\d+[,\.]\d+\s*€|€\s*\d+[,\.]\d+/)
              ? NodeFilter.FILTER_ACCEPT
              : NodeFilter.FILTER_REJECT
          }
        }
      )

      let count = 0
      while (walker.nextNode() && count < 5) {
        const parent = walker.currentNode.parentElement
        const className = parent.className
        const text = walker.currentNode.textContent.trim()
        results.push({ className, text })
        count++
      }
      return results
    })

    if (priceElements.length > 0) {
      console.log(`\n💡 Elementos com preços encontrados:`)
      priceElements.forEach((el, i) => {
        console.log(`  ${i + 1}. Classe: "${el.className}" → "${el.text}"`)
      })
    }

    // Screenshot
    const filename = `debug-${storeKey}.png`
    await page.screenshot({ path: filename, fullPage: false })
    console.log(`\n📸 Screenshot: ${filename}`)

    // Extrair HTML de exemplo
    const sampleHTML = await page.evaluate(() => {
      const product = document.querySelector('[class*="product"], [class*="item"], [data-product], [class*="tile"]')
      return product ? product.outerHTML.substring(0, 500) : 'Nenhum produto encontrado'
    })
    console.log(`\n📋 HTML de exemplo:`)
    console.log(sampleHTML.substring(0, 300) + '...')

  } catch (error) {
    console.log(`\n❌ ERRO: ${error.message}`)
  }
}

async function main() {
  console.log('🕷️  INVESTIGAÇÃO MULTI-SUPERMERCADOS\n')
  console.log('Vou investigar:', Object.values(stores).map(s => s.name).join(', '))
  console.log('')

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
  await page.setViewport({ width: 1920, height: 1080 })

  for (const [key, store] of Object.entries(stores)) {
    await investigateStore(page, key, store)
    await sleep(2000)
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log('✅ INVESTIGAÇÃO COMPLETA!')
  console.log('📁 Verifica os screenshots: debug-*.png')
  console.log('='.repeat(60))

  // Não fechar para poder ver
  // await browser.close()
}

main().catch(console.error)
