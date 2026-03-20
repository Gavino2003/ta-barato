const puppeteer = require('puppeteer')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function debugPingoDoceDirectURL() {
  console.log('\n🔍 DEBUG PINGO DOCE - URL DIRETO DE PESQUISA')
  console.log('='.repeat(60))

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')
  await page.setViewport({ width: 1920, height: 1080 })

  try {
    // Primeiro definir código postal
    const homeUrl = 'https://www.pingodoce.pt/home/produtos/promocoes'
    console.log(`\n📍 A aceder à página inicial para definir código postal...`)

    await page.goto(homeUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    })

    await sleep(2000)

    console.log('📝 A preencher código postal...')
    try {
      await page.type('#postalInput', '1000-001', { delay: 50 })
      await sleep(500)

      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, input[type="submit"]'))
        const submitBtn = buttons.find(btn => {
          const text = btn.textContent?.toLowerCase() || ''
          return text.includes('continuar') || text.includes('submit') || text.includes('confirmar')
        })
        if (submitBtn) submitBtn.click()
      })

      await sleep(5000)
      console.log('✓ Código postal submetido')
    } catch (e) {
      console.log(`⚠️  Erro: ${e.message}`)
    }

    // Agora navegar DIRETAMENTE para o URL de pesquisa
    const searchQuery = 'massa esparguete'
    const searchUrl = `https://www.pingodoce.pt/on/demandware.store/Sites-pingo-doce-Site/default/Search-Show?q=${encodeURIComponent(searchQuery)}`

    console.log(`\n🔍 A navegar para URL de pesquisa: ${searchUrl}`)

    await page.goto(searchUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    })

    await sleep(5000)

    console.log(`\n📍 URL atual: ${page.url()}`)

    // Ver produtos
    const produtos = await page.evaluate(() => {
      const cards = document.querySelectorAll('[data-pid]')

      return {
        totalProdutos: cards.length,
        primeiros5: Array.from(cards).slice(0, 5).map(p => {
          const img = p.querySelector('img')
          return {
            pid: p.getAttribute('data-pid'),
            imgAlt: img?.alt?.substring(0, 80),
            className: p.className
          }
        })
      }
    })

    console.log('\n📊 PRODUTOS ENCONTRADOS:')
    console.log(JSON.stringify(produtos, null, 2))

    console.log('\n💡 Deixa o browser aberto para investigares...')
    console.log('Press Ctrl+C para fechar.')

  } catch (e) {
    console.log(`✗ ERRO: ${e.message}`)
    await browser.close()
  }
}

debugPingoDoceDirectURL()
  .catch(console.error)
