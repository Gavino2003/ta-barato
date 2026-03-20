const puppeteer = require('puppeteer')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function investigatePingoDoceV4() {
  console.log('\n🔍 INVESTIGAR PINGO DOCE V4 - Aguardar carregamento dinâmico')
  console.log('='.repeat(60))

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')
  await page.setViewport({ width: 1920, height: 1080 })

  // Capturar requests de rede
  const requests = []
  page.on('request', request => {
    const url = request.url()
    if (url.includes('product') || url.includes('search') || url.includes('api')) {
      requests.push({
        url: url,
        method: request.method(),
        type: request.resourceType()
      })
    }
  })

  try {
    const url = 'https://www.pingodoce.pt/pesquisa/?text=massa%20esparguete'
    console.log(`\n📍 URL: ${url}`)

    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    })

    console.log('✓ Página carregada inicial')
    console.log('⏳ A aguardar 10 segundos para conteúdo dinâmico...')

    await sleep(10000)

    // Scroll para baixo para ativar lazy loading
    console.log('📜 A fazer scroll...')
    await page.evaluate(() => {
      window.scrollBy(0, 1000)
    })
    await sleep(2000)

    console.log('🔍 A procurar produtos...')

    // Investigar novamente
    const investigacao = await page.evaluate(() => {
      const resultados = {}

      // Procurar por qualquer elemento com preço
      const todosElementos = Array.from(document.querySelectorAll('*:not(script):not(style)'))
      const comEuro = todosElementos.filter(el => {
        const texto = el.textContent || ''
        return texto.includes('€') && texto.length < 150 && el.children.length < 5
      })

      resultados.elementosComEuro = {
        total: comEuro.length,
        primeiros10: comEuro.slice(0, 10).map(el => ({
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          texto: el.textContent?.trim().substring(0, 100)
        }))
      }

      // Procurar por tiles/cards/items
      const possiveisProdutos = document.querySelectorAll('[class*="tile"], [class*="card"], [class*="item"]:not([class*="menu"])')
      resultados.possiveisProdutos = {
        total: possiveisProdutos.length,
        primeiros5: Array.from(possiveisProdutos).slice(0, 5).map(el => ({
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          html: el.innerHTML.substring(0, 300)
        }))
      }

      // Procurar divs principais da página
      const mainContent = document.querySelector('main, [role="main"], #main, .main-content')
      resultados.mainContent = mainContent ? {
        tagName: mainContent.tagName,
        className: mainContent.className,
        id: mainContent.id,
        childrenCount: mainContent.children.length,
        primeiros5Filhos: Array.from(mainContent.children).slice(0, 5).map(child => ({
          tagName: child.tagName,
          className: child.className,
          id: child.id,
          childrenCount: child.children.length
        }))
      } : null

      // Dump de todos os IDs e classes principais
      const mainElements = Array.from(document.querySelectorAll('[id], [class]'))
        .filter(el => el.id || (el.className && typeof el.className === 'string' && el.className.length > 0))
        .filter(el => !el.tagName.match(/^(SCRIPT|STYLE|META|LINK)$/))

      resultados.elementosImportantes = {
        total: mainElements.length,
        primeiros20: mainElements.slice(0, 20).map(el => ({
          tagName: el.tagName,
          id: el.id,
          className: typeof el.className === 'string' ? el.className : '',
          childrenCount: el.children.length
        }))
      }

      return resultados
    })

    console.log('\n📊 INVESTIGAÇÃO:')
    console.log(JSON.stringify(investigacao, null, 2))

    console.log('\n🌐 CHAMADAS DE REDE CAPTURADAS:')
    console.log(JSON.stringify(requests.slice(0, 10), null, 2))

    console.log('\n💡 Deixa o browser aberto para investigares...')
    console.log('Press Ctrl+C para fechar.')

  } catch (e) {
    console.log(`✗ ERRO: ${e.message}`)
    await browser.close()
  }
}

investigatePingoDoceV4()
  .catch(console.error)
