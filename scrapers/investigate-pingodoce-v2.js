const puppeteer = require('puppeteer')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function investigatePingoDoceV2() {
  console.log('\n🔍 INVESTIGAR PINGO DOCE V2')
  console.log('='.repeat(60))

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')
  await page.setViewport({ width: 1920, height: 1080 })

  try {
    const url = 'https://www.pingodoce.pt/pesquisa/?text=massa%20esparguete'
    console.log(`\n📍 URL: ${url}`)

    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    })

    await sleep(5000)
    console.log('✓ Página carregada')

    // Investigar procurando especificamente por elementos de produto
    const investigacao = await page.evaluate(() => {
      // Procurar elementos que contenham "product" no className
      const todosElements = Array.from(document.querySelectorAll('*'))
      const comProduct = todosElements.filter(el => {
        const className = el.className?.toString().toLowerCase() || ''
        const tagName = el.tagName?.toLowerCase() || ''
        return className.includes('product') && !className.includes('nav') && tagName !== 'script' && tagName !== 'style'
      })

      // Procurar por cards de produtos (estruturas comuns)
      const estruturasComuns = {
        divComProduct: document.querySelectorAll('div[class*="product"]'),
        articleComProduct: document.querySelectorAll('article[class*="product"]'),
        liComProduct: document.querySelectorAll('li[class*="product"]'),
        dataProduct: document.querySelectorAll('[data-product]'),
        dataProductId: document.querySelectorAll('[data-product-id]'),
        divComCard: document.querySelectorAll('div[class*="card"]'),
        // Específico para Pingo Doce
        pdProduct: document.querySelectorAll('[class*="pd-"]'),
        gridProduct: document.querySelectorAll('[class*="grid"] [class*="item"]')
      }

      const resultados = {}
      Object.keys(estruturasComuns).forEach(key => {
        const els = estruturasComuns[key]
        if (els.length > 0) {
          resultados[key] = {
            total: els.length,
            primeiros3: Array.from(els).slice(0, 3).map(el => ({
              className: el.className,
              tagName: el.tagName,
              innerHTML: el.innerHTML.substring(0, 200) // primeiros 200 chars
            }))
          }
        }
      })

      return {
        estruturasEncontradas: resultados,
        elementosComProduct: comProduct.length,
        primeiros5ComProduct: comProduct.slice(0, 5).map(el => ({
          className: el.className,
          tagName: el.tagName
        }))
      }
    })

    console.log('\n📊 INVESTIGAÇÃO:')
    console.log(JSON.stringify(investigacao, null, 2))

    console.log('\n💡 Deixa o browser aberto para investigares...')
    console.log('Press Ctrl+C para fechar.')

  } catch (e) {
    console.log(`✗ ERRO: ${e.message}`)
    await browser.close()
  }
}

investigatePingoDoceV2()
  .catch(console.error)
