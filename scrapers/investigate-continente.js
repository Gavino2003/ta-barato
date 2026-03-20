const puppeteer = require('puppeteer')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function investigate() {
  console.log('🔍 INVESTIGAÇÃO CONTINENTE\n')

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')
  await page.setViewport({ width: 1920, height: 1080 })

  const url = 'https://www.continente.pt/pesquisa/?q=massa+esparguete'
  console.log(`📍 ${url}\n`)

  await page.goto(url, {
    waitUntil: 'networkidle2',
    timeout: 30000
  })

  await sleep(3000)

  // Investigar estrutura da página
  const info = await page.evaluate(() => {
    const result = {
      possibleProducts: []
    }

    // Procurar elementos que possam ser produtos
    const candidates = [
      ...document.querySelectorAll('[data-product]'),
      ...document.querySelectorAll('[class*="product"]'),
      ...document.querySelectorAll('[class*="tile"]'),
      ...document.querySelectorAll('[class*="card"]'),
      ...document.querySelectorAll('article')
    ]

    // Deduplicate
    const unique = [...new Set(candidates)]

    unique.slice(0, 20).forEach((el, i) => {
      const classes = el.className || ''
      const id = el.id || ''
      const tag = el.tagName.toLowerCase()

      // Tentar extrair dados
      const textContent = el.textContent?.trim().substring(0, 100) || ''
      const hasPrice = textContent.match(/€/) || textContent.match(/\d+[,.]\d+/)

      // Procurar nome
      const nameEl = el.querySelector('h1, h2, h3, h4, [class*="description"], [class*="name"], [class*="title"]')
      const name = nameEl?.textContent?.trim() || ''

      // Procurar preço
      const priceEl = el.querySelector('[class*="price"]')
      const price = priceEl?.textContent?.trim() || ''

      result.possibleProducts.push({
        index: i,
        tag,
        classes: classes.substring(0, 80),
        id,
        name: name.substring(0, 60),
        price: price.substring(0, 30),
        hasPrice: !!hasPrice,
        textPreview: textContent.substring(0, 80)
      })
    })

    return result
  })

  console.log('=' .repeat(80))
  console.log('ELEMENTOS ENCONTRADOS:\n')

  info.possibleProducts.forEach(p => {
    console.log(`${p.index}. <${p.tag}> ${p.classes ? `class="${p.classes}"` : ''}`)
    if (p.id) console.log(`   ID: ${p.id}`)
    if (p.name) console.log(`   Nome: "${p.name}"`)
    if (p.price) console.log(`   Preço: "${p.price}"`)
    console.log(`   Tem €: ${p.hasPrice}`)
    console.log(`   Preview: "${p.textPreview}"`)
    console.log()
  })

  console.log('=' .repeat(80))
  console.log('\n🖥️  Browser aberto para investigares manualmente.')
  console.log('Usa o inspector para ver os seletores corretos.')
  console.log('\nPress Ctrl+C para fechar.\n')

  // Não fechar
  // await browser.close()
}

investigate().catch(console.error)
