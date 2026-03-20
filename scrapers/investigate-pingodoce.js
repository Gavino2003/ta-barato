const puppeteer = require('puppeteer')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function investigatePingoDoce() {
  console.log('\n🔍 INVESTIGAR PINGO DOCE')
  console.log('='.repeat(60))

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')
  await page.setViewport({ width: 1920, height: 1080 })

  try {
    const urls = [
      'https://www.pingodoce.pt/pesquisa/?text=massa%20esparguete',
      'https://www.pingodoce.pt/home/produtos/mercearia/'
    ]

    for (const url of urls) {
      console.log(`\n📍 URL: ${url}`)

      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      })

      await sleep(3000)
      console.log('✓ Página carregada')

      // Investigar estrutura de cards de produtos
      const investigacao = await page.evaluate(() => {
        // Procurar vários tipos de seletores de produtos
        const possiveisSeletores = [
          '[class*="product"]',
          '[class*="tile"]',
          '[data-product]',
          '[class*="item"]',
          '.product-tile',
          '.product-card',
          '.product-item'
        ]

        const resultados = {}

        possiveisSeletores.forEach(selector => {
          const elementos = document.querySelectorAll(selector)
          if (elementos.length > 0) {
            resultados[selector] = {
              total: elementos.length,
              primeiroElemento: {
                className: elementos[0].className,
                innerHTML: elementos[0].innerHTML.substring(0, 300)
              }
            }
          }
        })

        // Também procurar todos os elementos que parecem ser produtos
        const todosElements = Array.from(document.querySelectorAll('*'))
        const produtosPossiveis = todosElements.filter(el => {
          const className = el.className?.toString().toLowerCase() || ''
          return className.includes('product') || className.includes('tile') || className.includes('item')
        })

        return {
          seletoresEncontrados: resultados,
          totalProdutosPossiveis: produtosPossiveis.length,
          primeiros5Classes: produtosPossiveis.slice(0, 5).map(el => el.className)
        }
      })

      console.log('\n📊 INVESTIGAÇÃO:')
      console.log(JSON.stringify(investigacao, null, 2))

      console.log('\n💡 Deixa o browser aberto para investigares...')
      console.log('Press Ctrl+C para fechar.')

      // Deixar aberto para investigação manual
      // await browser.close()
      return
    }

  } catch (e) {
    console.log(`✗ ERRO: ${e.message}`)
    await browser.close()
  }
}

investigatePingoDoce()
  .catch(console.error)
