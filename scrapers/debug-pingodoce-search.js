const puppeteer = require('puppeteer')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function debugPingoDoceSearch() {
  console.log('\n🔍 DEBUG PINGO DOCE SEARCH')
  console.log('='.repeat(60))

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')
  await page.setViewport({ width: 1920, height: 1080 })

  try {
    const homeUrl = 'https://www.pingodoce.pt/home/produtos/promocoes'
    console.log(`\n📍 A aceder à página inicial...`)

    await page.goto(homeUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    })

    await sleep(2000)

    // Preencher código postal
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

    // Verificar URL atual
    console.log(`\n📍 URL antes da pesquisa: ${page.url()}`)

    // Pesquisar
    console.log(`\n🔍 A pesquisar por "massa esparguete"...`)
    await page.type('#header-search-bar', 'massa esparguete', { delay: 50 })
    await sleep(1000)

    // Tirar screenshot antes de pressionar Enter
    await page.screenshot({ path: 'antes-enter.png' })
    console.log('📸 Screenshot guardado: antes-enter.png')

    await page.keyboard.press('Enter')
    await sleep(10000)

    // Verificar URL após pesquisa
    console.log(`\n📍 URL após pesquisa: ${page.url()}`)

    // Tirar screenshot após pesquisa
    await page.screenshot({ path: 'apos-pesquisa.png' })
    console.log('📸 Screenshot guardado: apos-pesquisa.png')

    // Ver quantos produtos há
    const debug = await page.evaluate(() => {
      const produtos = document.querySelectorAll('[data-pid]')
      const primeiros3 = Array.from(produtos).slice(0, 3).map(p => {
        const img = p.querySelector('img')
        return {
          pid: p.getAttribute('data-pid'),
          imgAlt: img?.alt?.substring(0, 80)
        }
      })

      return {
        totalProdutos: produtos.length,
        primeiros3
      }
    })

    console.log('\n📊 PRODUTOS ENCONTRADOS:')
    console.log(JSON.stringify(debug, null, 2))

    console.log('\n💡 Deixa o browser aberto para investigares...')
    console.log('Press Ctrl+C para fechar.')

  } catch (e) {
    console.log(`✗ ERRO: ${e.message}`)
    await browser.close()
  }
}

debugPingoDoceSearch()
  .catch(console.error)
