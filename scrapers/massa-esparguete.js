const puppeteer = require('puppeteer')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

function extractPrice(text) {
  if (!text) return null
  const cleaned = text.replace(/\s/g, '')
  const match = cleaned.match(/(\d+)[,.](\d+)/)
  if (match) {
    return parseFloat(`${match[1]}.${match[2]}`)
  }
  return null
}

async function scrapeContinente(page) {
  console.log('\n🔴 CONTINENTE - Massa Esparguete')
  console.log('━'.repeat(60))

  try {
    const url = 'https://www.continente.pt/pesquisa/?q=massa+esparguete'
    console.log(`📍 URL: ${url}`)

    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    })

    await sleep(3000)

    console.log('✓ Página carregada')

    // Tentar MUITOS seletores diferentes
    const seletores = [
      '.pwc-tile--price-primary',
      '.ct-price-value',
      '[data-price]',
      '.product-price',
      '.sales-price',
      '[class*="price-value"]',
      '[class*="tile--price"]',
      '.price'
    ]

    console.log('\n🔍 A tentar seletores...')

    for (const selector of seletores) {
      try {
        const elements = await page.$$(selector)
        if (elements.length > 0) {
          const firstText = await page.evaluate(el => el?.textContent, elements[0])
          const price = extractPrice(firstText)

          console.log(`  Seletor "${selector}":`)
          console.log(`    - Encontrados: ${elements.length}`)
          console.log(`    - Primeiro: "${firstText?.trim()}"`)

          if (price && price > 0 && price < 10) {
            console.log(`    ✓ PREÇO VÁLIDO: €${price.toFixed(2)}`)
            return { preco: price, encontrado: true }
          }
        }
      } catch (e) {
        // Silenciar
      }
    }

    // Fallback: procurar qualquer texto com €
    console.log('\n💡 A procurar texto com €...')
    const anyPrice = await page.evaluate(() => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT
      )

      const prices = []
      while (walker.nextNode()) {
        const text = walker.currentNode.textContent
        if (text.match(/\d+[,\.]\d+\s*€/) || text.match(/€\s*\d+[,\.]\d+/)) {
          prices.push(text.trim())
        }
      }
      return prices.slice(0, 10) // Primeiros 10
    })

    if (anyPrice.length > 0) {
      console.log('  Textos com € encontrados:')
      anyPrice.forEach((t, i) => {
        console.log(`    ${i + 1}. "${t.substring(0, 50)}"`)
      })

      const firstPrice = extractPrice(anyPrice[0])
      if (firstPrice && firstPrice > 0 && firstPrice < 10) {
        console.log(`  ✓ PREÇO EXTRAÍDO: €${firstPrice.toFixed(2)}`)
        return { preco: firstPrice, encontrado: true }
      }
    }

    console.log('\n✗ NÃO CONSEGUI OBTER PREÇO')
    return { preco: null, encontrado: false }

  } catch (e) {
    console.log(`\n✗ ERRO: ${e.message}`)
    return { preco: null, encontrado: false }
  }
}

async function scrapePingoDoce(page) {
  console.log('\n🟢 PINGO DOCE - Massa Esparguete')
  console.log('━'.repeat(60))

  try {
    // Tentar várias URLs
    const urls = [
      'https://www.pingodoce.pt/pesquisa/?text=massa+esparguete',
      'https://www.pingodoce.pt/home/produtos/mercearia/',
      'https://www.pingodoce.pt/produtos/'
    ]

    for (const url of urls) {
      console.log(`\n📍 A tentar: ${url}`)

      try {
        await page.goto(url, {
          waitUntil: 'networkidle2',
          timeout: 30000
        })

        await sleep(3000)
        console.log('✓ Página carregada')

        // Seletores para Pingo Doce
        const seletores = [
          '.sales-price',
          '.product-price',
          '[data-price]',
          '.price',
          '[class*="price"]',
          '.ct-price-value'
        ]

        console.log('🔍 A tentar seletores...')

        for (const selector of seletores) {
          try {
            const elements = await page.$$(selector)
            if (elements.length > 0) {
              const firstText = await page.evaluate(el => el?.textContent, elements[0])
              const price = extractPrice(firstText)

              console.log(`  Seletor "${selector}":`)
              console.log(`    - Encontrados: ${elements.length}`)
              console.log(`    - Primeiro: "${firstText?.trim()}"`)

              if (price && price > 0 && price < 10) {
                console.log(`    ✓ PREÇO VÁLIDO: €${price.toFixed(2)}`)
                return { preco: price, encontrado: true }
              }
            }
          } catch (e) {
            // Silenciar
          }
        }

        // Tentar texto com €
        const anyPrice = await page.evaluate(() => {
          const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT
          )

          const prices = []
          while (walker.nextNode()) {
            const text = walker.currentNode.textContent
            if (text.match(/\d+[,\.]\d+\s*€/) || text.match(/€\s*\d+[,\.]\d+/)) {
              prices.push(text.trim())
            }
          }
          return prices.slice(0, 10)
        })

        if (anyPrice.length > 0) {
          console.log('  Textos com € encontrados:')
          anyPrice.forEach((t, i) => {
            console.log(`    ${i + 1}. "${t.substring(0, 50)}"`)
          })

          const firstPrice = extractPrice(anyPrice[0])
          if (firstPrice && firstPrice > 0 && firstPrice < 10) {
            console.log(`  ✓ PREÇO EXTRAÍDO: €${firstPrice.toFixed(2)}`)
            return { preco: price, encontrado: true }
          }
        }

      } catch (e) {
        console.log(`  ✗ Erro neste URL: ${e.message.substring(0, 50)}`)
        continue
      }
    }

    console.log('\n✗ NÃO CONSEGUI OBTER PREÇO (tentei múltiplos URLs)')
    return { preco: null, encontrado: false }

  } catch (e) {
    console.log(`\n✗ ERRO GERAL: ${e.message}`)
    return { preco: null, encontrado: false }
  }
}

async function scrapeMinipeco(page) {
  console.log('\n🟡 MINIPREÇO - Massa Esparguete')
  console.log('━'.repeat(60))

  try {
    // Tentar várias URLs
    const urls = [
      'https://www.minipreco.pt/pesquisa?q=massa+esparguete',
      'https://www.minipreco.pt/search?q=massa+esparguete',
      'https://www.minipreco.pt/produtos/mercearia',
      'https://www.minipreco.pt/'
    ]

    for (const url of urls) {
      console.log(`\n📍 A tentar: ${url}`)

      try {
        await page.goto(url, {
          waitUntil: 'networkidle2',
          timeout: 30000
        })

        await sleep(3000)
        console.log('✓ Página carregada')

        // Seletores para Minipreço
        const seletores = [
          '.price',
          '.product-price',
          '.sales-price',
          '[data-price]',
          '[class*="price"]',
          '[class*="Price"]',
          '.pwc-tile--price-primary',
          '.ct-price-value'
        ]

        console.log('🔍 A tentar seletores...')

        for (const selector of seletores) {
          try {
            const elements = await page.$$(selector)
            if (elements.length > 0) {
              const firstText = await page.evaluate(el => el?.textContent, elements[0])
              const price = extractPrice(firstText)

              console.log(`  Seletor "${selector}":`)
              console.log(`    - Encontrados: ${elements.length}`)
              console.log(`    - Primeiro: "${firstText?.trim()}"`)

              if (price && price > 0 && price < 10) {
                console.log(`    ✓ PREÇO VÁLIDO: €${price.toFixed(2)}`)
                return { preco: price, encontrado: true }
              }
            }
          } catch (e) {
            // Silenciar
          }
        }

        // Tentar texto com €
        const anyPrice = await page.evaluate(() => {
          const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT
          )

          const prices = []
          while (walker.nextNode()) {
            const text = walker.currentNode.textContent
            if (text.match(/\d+[,\.]\d+\s*€/) || text.match(/€\s*\d+[,\.]\d+/)) {
              prices.push(text.trim())
            }
          }
          return prices.slice(0, 10)
        })

        if (anyPrice.length > 0) {
          console.log('  Textos com € encontrados:')
          anyPrice.forEach((t, i) => {
            console.log(`    ${i + 1}. "${t.substring(0, 50)}"`)
          })

          // Procurar o PRIMEIRO preço válido (ignorar €0.00)
          for (const priceText of anyPrice) {
            const price = extractPrice(priceText)
            if (price && price > 0 && price < 10) {
              console.log(`  ✓ PREÇO EXTRAÍDO: €${price.toFixed(2)}`)
              return { preco: price, encontrado: true }
            }
          }
        }

      } catch (e) {
        console.log(`  ✗ Erro neste URL: ${e.message.substring(0, 50)}`)
        continue
      }
    }

    console.log('\n✗ NÃO CONSEGUI OBTER PREÇO (tentei múltiplos URLs)')
    return { preco: null, encontrado: false }

  } catch (e) {
    console.log(`\n✗ ERRO GERAL: ${e.message}`)
    return { preco: null, encontrado: false }
  }
}

async function main() {
  console.log('🍝 SCRAPER FOCADO: MASSA ESPARGUETE')
  console.log('=' .repeat(60))
  console.log('Só vou buscar dados REAIS. Se não conseguir, digo.')
  console.log('='.repeat(60))

  const browser = await puppeteer.launch({
    headless: false,  // Ver o browser
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')
  await page.setViewport({ width: 1920, height: 1080 })

  // Scrape Continente
  const continente = await scrapeContinente(page)

  await sleep(2000)

  // Scrape Pingo Doce
  const pingoDoce = await scrapePingoDoce(page)

  await sleep(2000)

  // Scrape Minipreço
  const minipreco = await scrapeMinipeco(page)

  console.log('\n' + '='.repeat(60))
  console.log('📊 RESULTADOS FINAIS')
  console.log('='.repeat(60))

  console.log('\nCONTINENTE:')
  if (continente.encontrado) {
    console.log(`  ✅ Preço obtido: €${continente.preco.toFixed(2)}`)
  } else {
    console.log(`  ❌ NÃO CONSEGUI obter preço`)
  }

  console.log('\nPINGO DOCE:')
  if (pingoDoce.encontrado) {
    console.log(`  ✅ Preço obtido: €${pingoDoce.preco.toFixed(2)}`)
  } else {
    console.log(`  ❌ NÃO CONSEGUI obter preço`)
  }

  console.log('\nMINIPREÇO:')
  if (minipreco.encontrado) {
    console.log(`  ✅ Preço obtido: €${minipreco.preco.toFixed(2)}`)
  } else {
    console.log(`  ❌ NÃO CONSEGUI obter preço`)
  }

  console.log('\n' + '='.repeat(60))

  if (continente.encontrado || pingoDoce.encontrado || minipreco.encontrado) {
    console.log('✅ SUCESSO PARCIAL! Consegui pelo menos 1 preço.')
  } else {
    console.log('❌ FALHA TOTAL. Não consegui nenhum preço.')
    console.log('💡 Vou precisar de ajustar os seletores ou estratégia.')
  }

  console.log('\n🖥️  Browser vai ficar aberto para poderes investigar...')
  console.log('Press Ctrl+C para fechar.')

  // NÃO fechar o browser para poder investigar
  // await browser.close()
}

main().catch(console.error)
