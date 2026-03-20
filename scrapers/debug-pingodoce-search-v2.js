const puppeteer = require('puppeteer')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function debugPingoDoceSearchV2() {
  console.log('\n🔍 DEBUG PINGO DOCE SEARCH V2 - Clicar no botão')
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

    console.log(`\n📍 URL antes da pesquisa: ${page.url()}`)

    // Investigar o campo de pesquisa e botões ao redor
    console.log('\n🔍 A investigar campo de pesquisa...')
    const searchInfo = await page.evaluate(() => {
      const searchInput = document.querySelector('#header-search-bar')

      if (!searchInput) return { found: false }

      // Procurar por botão de pesquisa
      const parent = searchInput.parentElement
      const grandParent = parent?.parentElement

      const buttons = Array.from(document.querySelectorAll('button, [role="button"], .search-button, [class*="search"]'))
        .filter(btn => {
          const rect = btn.getBoundingClientRect()
          return rect.width > 0 && rect.height > 0 // Visível
        })
        .map(btn => ({
          tagName: btn.tagName,
          className: btn.className,
          id: btn.id,
          type: btn.type,
          innerHTML: btn.innerHTML.substring(0, 100),
          ariaLabel: btn.getAttribute('aria-label')
        }))

      return {
        found: true,
        inputId: searchInput.id,
        inputName: searchInput.name,
        inputClass: searchInput.className,
        parentClass: parent?.className,
        grandParentClass: grandParent?.className,
        buttons: buttons.slice(0, 10)
      }
    })

    console.log('\n📊 INFO DO CAMPO DE PESQUISA:')
    console.log(JSON.stringify(searchInfo, null, 2))

    // Agora pesquisar
    console.log(`\n🔍 A pesquisar por "massa esparguete"...`)
    await page.type('#header-search-bar', 'massa esparguete', { delay: 50 })
    await sleep(1000)

    // Procurar e clicar no botão de pesquisa
    console.log('🖱️  A tentar encontrar e clicar no botão de pesquisa...')
    const clicked = await page.evaluate(() => {
      // Tentar vários seletores para o botão de pesquisa
      const selectors = [
        'button[type="submit"]',
        '.search-button',
        '[class*="search-submit"]',
        '[class*="search-icon"]',
        'button[aria-label*="search"]',
        'button[aria-label*="pesquisar"]'
      ]

      for (const selector of selectors) {
        const btn = document.querySelector(selector)
        if (btn) {
          const rect = btn.getBoundingClientRect()
          if (rect.width > 0 && rect.height > 0) {
            btn.click()
            return { success: true, selector }
          }
        }
      }

      // Se não encontrou, procurar por ícone de lupa perto do input
      const searchInput = document.querySelector('#header-search-bar')
      if (searchInput) {
        const parent = searchInput.parentElement
        const siblings = parent ? Array.from(parent.children) : []

        for (const sibling of siblings) {
          if (sibling !== searchInput && sibling.tagName === 'BUTTON') {
            sibling.click()
            return { success: true, selector: 'sibling button' }
          }
        }
      }

      return { success: false }
    })

    console.log('Resultado do clique:', JSON.stringify(clicked, null, 2))

    await sleep(10000)

    console.log(`\n📍 URL após pesquisa: ${page.url()}`)

    // Ver produtos
    const produtos = await page.evaluate(() => {
      const cards = document.querySelectorAll('[data-pid]')

      return {
        totalProdutos: cards.length,
        primeiros3: Array.from(cards).slice(0, 3).map(p => {
          const img = p.querySelector('img')
          return {
            pid: p.getAttribute('data-pid'),
            imgAlt: img?.alt?.substring(0, 80)
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

debugPingoDoceSearchV2()
  .catch(console.error)
