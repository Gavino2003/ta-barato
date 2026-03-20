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

async function scrapeContinente(searchQuery) {
  console.log('\n🔴 CONTINENTE - ' + searchQuery)
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
    const url = `https://www.continente.pt/pesquisa/?q=${encodeURIComponent(searchQuery)}`
    console.log(`📍 URL: ${url}`)

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 18000
    })

    await sleep(800)
    console.log('✓ Página carregada')

    // Extrair dados do PRIMEIRO produto (usar seletor correto: .productTile ou .product-tile)
    const produto = await page.evaluate(() => {
      const card = document.querySelector('.productTile, .product-tile')

      if (!card) return null

      // Nome do produto (pode estar em .ct-tile--description ou similar)
      const nomeEl = card.querySelector('.ct-tile--description, .pwc-tile--description, [class*="description"], h3, h4')
      const nome = nomeEl?.textContent?.trim() || ''

      // Preço (usar .pwc-tile--price-primary)
      const precoEl = card.querySelector('.pwc-tile--price-primary, [class*="price-primary"], [class*="price-value"]')
      const precoTexto = precoEl?.textContent?.trim() || ''

      // Quantidade
      const qtyEl = card.querySelector('.pwc-tile--quantity, .ct-tile--quantity, [class*="quantity"]')
      const quantidade = qtyEl?.textContent?.trim() || ''

      // Marca (primeira palavra do nome geralmente)
      const marcaEl = card.querySelector('[class*="brand"]')
      const marca = marcaEl?.textContent?.trim() || ''

      // Imagem do produto (usar ct-tile-image, não ct-tile--image)
      const imgEl = card.querySelector('img.ct-tile-image, .ct-tile-image, .pwc-tile-image img, .product-image img')
      const imagem = imgEl ? (imgEl.src || imgEl.dataset.src || imgEl.getAttribute('data-src') || '') : ''

      // URL do produto (link dentro do card)
      const linkEl = card.querySelector('a[href], .product-link, [class*="product"] a')
      let url = linkEl?.href || ''
      // Se o URL for relativo, adicionar o domínio
      if (url && !url.startsWith('http')) {
        url = 'https://www.continente.pt' + url
      }

      return {
        nome,
        precoTexto,
        quantidade,
        marca,
        imagem,
        url
      }
    })

    if (!produto || !produto.nome) {
      console.log('✗ Produto não encontrado')
      await browser.close()
      return null
    }

    const preco = extractPrice(produto.precoTexto)

    if (!preco || preco <= 0) {
      console.log('✗ Preço inválido')
      await browser.close()
      return null
    }

    console.log(`✓ Nome: ${produto.nome}`)
    console.log(`✓ Preço: €${preco.toFixed(2)}`)
    console.log(`✓ Quantidade: ${produto.quantidade}`)
    console.log(`✓ Marca: ${produto.marca || '(do título)'}`)
    console.log(`✓ Imagem: ${produto.imagem ? 'Sim' : 'Não'}`)
    console.log(`✓ URL: ${produto.url || 'Não'}`)

    await browser.close()

    return {
      supermercado: 'Continente',
      nome: produto.nome,
      preco: preco,
      quantidade: produto.quantidade,
      marca: produto.marca || produto.nome.split(' ')[0],
      imagem: produto.imagem,
      url: produto.url,
      encontrado: true
    }

  } catch (e) {
    console.log(`✗ ERRO: ${e.message}`)
    await browser.close()
    return null
  }
}

// Se executado diretamente
if (require.main === module) {
  const query = process.argv[2] || 'massa esparguete'
  scrapeContinente(query)
    .then(result => {
      console.log('\n' + '='.repeat(60))
      console.log('RESULTADO:')
      console.log(JSON.stringify(result, null, 2))
    })
    .catch(console.error)
}

module.exports = { scrapeContinente }
