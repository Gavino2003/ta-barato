const puppeteer = require('puppeteer')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function investigate() {
  console.log('🔍 Investigando estrutura dos sites...\n')

  const browser = await puppeteer.launch({
    headless: false, // Abre o browser para ver
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')

  // CONTINENTE
  console.log('📦 CONTINENTE - Pesquisando leite...')
  await page.goto('https://www.continente.pt/pesquisa/?q=leite', {
    waitUntil: 'networkidle2',
    timeout: 30000
  })

  await sleep(3000)

  // Tentar encontrar seletores de preço
  const continenteSelectors = [
    '.ct-price-value',
    '[data-price]',
    '.product-price',
    '.pwc-tile--price-primary',
    '.price',
    '[class*="price"]',
    '.ct-tile--price'
  ]

  console.log('\n🔎 Tentando seletores no Continente:')
  for (const selector of continenteSelectors) {
    try {
      const elements = await page.$$(selector)
      if (elements.length > 0) {
        const firstText = await page.evaluate(el => el?.textContent, elements[0])
        console.log(`  ✓ "${selector}": ${elements.length} elementos - Exemplo: "${firstText?.trim()}"`)
      }
    } catch (e) {
      // Silenciar erros
    }
  }

  // Guardar screenshot
  await page.screenshot({ path: 'debug-continente.png', fullPage: false })
  console.log('\n📸 Screenshot guardado: debug-continente.png')

  // Extrair HTML de um produto
  const productHTML = await page.evaluate(() => {
    const product = document.querySelector('[class*="product"], [class*="tile"], [data-product]')
    return product ? product.outerHTML : 'Não encontrado'
  })

  console.log('\n📄 HTML de exemplo de produto:')
  console.log(productHTML.substring(0, 500) + '...\n')

  // LIDL
  console.log('\n📦 LIDL - Pesquisando leite...')
  await page.goto('https://www.lidl.pt/c/leite/c1064', {
    waitUntil: 'networkidle2',
    timeout: 30000
  })

  await sleep(3000)

  const lidlSelectors = [
    '.price',
    '[data-price]',
    '.m-price__price',
    '.product-price',
    '[class*="price"]'
  ]

  console.log('\n🔎 Tentando seletores no Lidl:')
  for (const selector of lidlSelectors) {
    try {
      const elements = await page.$$(selector)
      if (elements.length > 0) {
        const firstText = await page.evaluate(el => el?.textContent, elements[0])
        console.log(`  ✓ "${selector}": ${elements.length} elementos - Exemplo: "${firstText?.trim()}"`)
      }
    } catch (e) {
      // Silenciar
    }
  }

  await page.screenshot({ path: 'debug-lidl.png', fullPage: false })
  console.log('\n📸 Screenshot guardado: debug-lidl.png')

  // AUCHAN
  console.log('\n📦 AUCHAN - Homepage...')
  await page.goto('https://www.auchan.pt', {
    waitUntil: 'networkidle2',
    timeout: 30000
  })

  await sleep(3000)
  await page.screenshot({ path: 'debug-auchan.png', fullPage: false })
  console.log('📸 Screenshot guardado: debug-auchan.png')

  console.log('\n✅ Investigação completa!')
  console.log('📁 Verifica os screenshots: debug-*.png')
  console.log('\n💡 Próximo passo: Analisa os screenshots e HTML para identificar seletores corretos')

  // Não fechar para poder ver
  // await browser.close()
}

investigate().catch(console.error)
