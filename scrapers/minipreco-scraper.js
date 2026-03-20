const { getBrowserConfig } = require('./browser-config')

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

async function scrapeMinipeco(searchQuery) {
  console.log('\n🟡 MINIPREÇO - ' + searchQuery)
  console.log('━'.repeat(60))

  const { puppeteer, launchOptions } = await getBrowserConfig()
  const browser = await puppeteer.launch(launchOptions)

  const page = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')
  await page.setViewport({ width: 1920, height: 1080 })
  await page.setRequestInterception(true)
  page.on('request', (req) => {
    const type = req.resourceType()
    if (type === 'image' || type === 'font' || type === 'media') {
      req.abort()
      return
    }
    req.continue()
  })

  try {
    // Tentar várias URLs
    const urls = [
      `https://www.minipreco.pt/search?q=${encodeURIComponent(searchQuery)}`,
      `https://www.minipreco.pt/pesquisa?q=${encodeURIComponent(searchQuery)}`,
      'https://www.minipreco.pt/produtos/mercearia'
    ]

    for (const url of urls) {
      console.log(`\n📍 URL: ${url}`)

      try {
        await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 12000
        })

        await sleep(1000)
        console.log('✓ Página carregada')

        // Usar o seletor correto identificado: .product-list__item
        const produtosCards = await page.evaluate(() => {
          // Procurar todos os cards de produtos com o seletor correto
          const cards = Array.from(document.querySelectorAll('.product-list__item'))

          return cards.slice(0, 10).map(card => {
            // Nome do produto (está no link .productMainLink)
            const linkEl = card.querySelector('.productMainLink')
            const textoCompleto = linkEl?.textContent?.trim() || ''

            // O texto tem formato: "MARCA Produto Quantidade\n\npreço..."
            // Separar por quebras de linha e pegar só a primeira parte
            const nome = textoCompleto.split('\n')[0].trim()

            // Preço (tem classe .price ou similar)
            const precoEl = card.querySelector('.price, [class*="price"]')
            const precoTexto = precoEl?.textContent?.trim() || ''

            // A quantidade geralmente está no nome (ex: "500 g", "1 kg")
            const quantidadeMatch = nome.match(/(\d+\s*(g|kg|ml|l|un|unidades))/i)
            const quantidade = quantidadeMatch ? quantidadeMatch[0] : ''

            // Marca (geralmente é a primeira palavra do nome)
            const marca = nome.split(' ')[0] || ''

            // Imagem do produto
            const imgEl = card.querySelector('img')
            const imagem = imgEl ? (imgEl.src || imgEl.dataset.src || imgEl.getAttribute('data-src') || '') : ''

            // URL do produto (usar o linkEl já declarado acima)
            let url = linkEl?.href || ''
            // Se o URL for relativo, adicionar o domínio
            if (url && !url.startsWith('http')) {
              url = 'https://www.minipreco.pt' + url
            }

            return {
              nome,
              precoTexto,
              quantidade,
              marca,
              imagem,
              url
            }
          }).filter(p => p.nome && p.precoTexto)
        })

        console.log(`📦 Encontrados ${produtosCards.length} produtos`)

        // Procurar o primeiro produto com preço válido (não €0.00)
        for (const produto of produtosCards) {
          const preco = extractPrice(produto.precoTexto)

          console.log(`\n  Produto: ${produto.nome.substring(0, 50)}`)
          console.log(`    Preço texto: "${produto.precoTexto}"`)
          console.log(`    Preço extraído: ${preco}`)
          console.log(`    Quantidade: "${produto.quantidade}"`)

          if (preco && preco > 0 && preco < 10) {
            console.log(`  ✓ PRODUTO VÁLIDO ENCONTRADO!`)
            console.log(`✓ Nome: ${produto.nome}`)
            console.log(`✓ Preço: €${preco.toFixed(2)}`)
            console.log(`✓ Quantidade: ${produto.quantidade}`)
            console.log(`✓ Marca: ${produto.marca || '(do título)'}`)
            console.log(`✓ Imagem: ${produto.imagem ? 'Sim' : 'Não'}`)
            console.log(`✓ URL: ${produto.url || 'Não'}`)

            await browser.close()

            return {
              supermercado: 'Minipreço',
              nome: produto.nome,
              preco: preco,
              quantidade: produto.quantidade,
              marca: produto.marca || produto.nome.split(' ')[0],
              imagem: produto.imagem,
              url: produto.url,
              encontrado: true
            }
          }
        }

        console.log('  ✗ Nenhum produto com preço válido neste URL')

      } catch (e) {
        console.log(`  ✗ Erro neste URL: ${e.message.substring(0, 50)}`)
        continue
      }
    }

    console.log('\n✗ Não consegui obter dados em nenhum URL')
    await browser.close()
    return null

  } catch (e) {
    console.log(`✗ ERRO: ${e.message}`)
    await browser.close()
    return null
  }
}

// Se executado diretamente
if (require.main === module) {
  const query = process.argv[2] || 'massa esparguete'
  scrapeMinipeco(query)
    .then(result => {
      console.log('\n' + '='.repeat(60))
      console.log('RESULTADO:')
      console.log(JSON.stringify(result, null, 2))
    })
    .catch(console.error)
}

module.exports = { scrapeMinipeco }
