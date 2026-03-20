const puppeteer = require('puppeteer')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function investigatePingoDoceV5() {
  console.log('\n🔍 INVESTIGAR PINGO DOCE V5 - Tentar submeter código postal')
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

    // Procurar por modal de código postal
    console.log('🔍 A procurar modal de código postal...')

    const hasPostalCodeModal = await page.evaluate(() => {
      // Procurar por inputs de código postal
      const postalInputs = document.querySelectorAll('input[type="text"], input[placeholder*="postal"], input[placeholder*="código"]')

      const modals = document.querySelectorAll('[class*="modal"], [class*="popup"], [class*="overlay"]')

      return {
        totalInputs: postalInputs.length,
        primeiros5Inputs: Array.from(postalInputs).slice(0, 5).map(input => ({
          type: input.type,
          placeholder: input.placeholder,
          name: input.name,
          id: input.id,
          className: input.className
        })),
        totalModals: modals.length,
        primeiros3Modals: Array.from(modals).slice(0, 3).map(modal => ({
          tagName: modal.tagName,
          className: modal.className,
          id: modal.id,
          visible: modal.offsetHeight > 0
        }))
      }
    })

    console.log('\n📊 Modals e inputs encontrados:')
    console.log(JSON.stringify(hasPostalCodeModal, null, 2))

    // Tentar preencher código postal (1000-001 Lisboa)
    console.log('\n📝 A tentar preencher código postal...')

    try {
      await page.type('input[type="text"]', '1000-001', { delay: 100 })
      await sleep(1000)

      // Procurar botão de submeter
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, input[type="submit"], [role="button"]'))
        const submitBtn = buttons.find(btn => {
          const text = btn.textContent?.toLowerCase() || ''
          return text.includes('continuar') || text.includes('submit') || text.includes('confirmar')
        })
        if (submitBtn) submitBtn.click()
      })

      await sleep(5000)
      console.log('✓ Formulário submetido')
    } catch (e) {
      console.log(`  ⚠️  Não consegui preencher formulário: ${e.message}`)
    }

    // Agora procurar produtos
    console.log('\n🔍 A procurar produtos...')

    const produtos = await page.evaluate(() => {
      // Procurar por cards de produtos usando vários seletores
      const possiveisSeletores = [
        '.product-tile',
        '.product-card',
        '.product-item',
        '[class*="product-"]',
        '[data-pid]',
        '.tile',
        '[class*="tile"]'
      ]

      const resultados = {}

      possiveisSeletores.forEach(selector => {
        const elementos = document.querySelectorAll(selector)
        if (elementos.length > 0) {
          resultados[selector] = {
            total: elementos.length,
            primeiro: {
              tagName: elementos[0].tagName,
              className: elementos[0].className,
              html: elementos[0].innerHTML.substring(0, 400)
            }
          }
        }
      })

      // Também procurar por preços
      const elementosComEuro = Array.from(document.querySelectorAll('*:not(script):not(style)'))
        .filter(el => {
          const texto = el.textContent || ''
          return texto.includes('€') && texto.length < 100 && el.children.length < 3
        })

      return {
        seletoresProdutos: resultados,
        totalElementosComEuro: elementosComEuro.length,
        primeiros5ComEuro: elementosComEuro.slice(0, 5).map(el => ({
          tagName: el.tagName,
          className: el.className,
          texto: el.textContent?.trim().substring(0, 80)
        }))
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

investigatePingoDoceV5()
  .catch(console.error)
