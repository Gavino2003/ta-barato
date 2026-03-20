const puppeteer = require('puppeteer')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function debugPingoDoce() {
  console.log('\n🔍 DEBUG PINGO DOCE')
  console.log('='.repeat(60))

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')
  await page.setViewport({ width: 1920, height: 1080 })

  try {
    const url = 'https://www.pingodoce.pt/home/produtos/promocoes'
    console.log(`\n📍 URL: ${url}`)

    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    })

    await sleep(3000)
    console.log('✓ Página carregada')

    // Preencher código postal
    console.log('📝 A preencher código postal...')
    try {
      await page.type('#postalInput', '1000-001', { delay: 50 })
      await sleep(500)

      // Clicar no botão de continuar
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, input[type="submit"]'))
        const submitBtn = buttons.find(btn => {
          const text = btn.textContent?.toLowerCase() || ''
          return text.includes('continuar') || text.includes('submit') || text.includes('confirmar')
        })
        if (submitBtn) {
          console.log('Found button:', submitBtn.textContent)
          submitBtn.click()
        } else {
          console.log('No submit button found')
        }
      })

      console.log('✓ Código postal submetido, a aguardar...')
      await sleep(10000)  // Aguardar 10 segundos

    } catch (e) {
      console.log(`⚠️  Erro: ${e.message}`)
    }

    // Verificar o URL atual
    const currentUrl = page.url()
    console.log(`\n📍 URL atual: ${currentUrl}`)

    // Procurar produtos
    const debug = await page.evaluate(() => {
      const produtos = document.querySelectorAll('[data-pid]')

      return {
        totalProdutos: produtos.length,
        primeiros3: Array.from(produtos).slice(0, 3).map(p => ({
          pid: p.getAttribute('data-pid'),
          className: p.className,
          html: p.innerHTML.substring(0, 200)
        }))
      }
    })

    console.log('\n📊 DEBUG:')
    console.log(JSON.stringify(debug, null, 2))

    console.log('\n💡 Deixa o browser aberto...')
    console.log('Press Ctrl+C para fechar.')

  } catch (e) {
    console.log(`✗ ERRO: ${e.message}`)
    await browser.close()
  }
}

debugPingoDoce()
  .catch(console.error)
