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

async function scrapePingoDoce(searchQuery) {
  console.log('\n🟢 PINGO DOCE - ' + searchQuery)
  console.log('━'.repeat(60))

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')
  await page.setViewport({ width: 1920, height: 1080 })

  try {
    // Ir direto para o URL de pesquisa
    const searchUrl = `https://www.pingodoce.pt/on/demandware.store/Sites-pingo-doce-Site/default/Search-Show?q=${encodeURIComponent(searchQuery)}`
    console.log(`🔍 A pesquisar por "${searchQuery}"...`)

    await page.goto(searchUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    })

    await sleep(3000)
    console.log('✓ Pesquisa executada')

    // Procurar produtos
    console.log('🔍 A procurar produtos...')

    // Extrair dados do PRIMEIRO produto
    const produto = await page.evaluate(() => {
      const cards = document.querySelectorAll('[data-pid]')

      if (cards.length === 0) return null

      // Procurar pelo primeiro product-tile-pd dentro dos cards
      let card = null
      for (const c of cards) {
        if (c.className.includes('product-tile-pd')) {
          card = c
          break
        }
      }

      // Se não encontrou product-tile-pd, procurar dentro do primeiro card
      if (!card) {
        card = cards[0].querySelector('.product-tile-pd')
      }

      // Se ainda não encontrou, usar o primeiro card mesmo
      if (!card) {
        card = cards[0]
      }

      // Nome do produto - procurar em vários lugares
      let nome = ''

      // Tentar o atributo alt da imagem
      const imgEl = card.querySelector('img')
      nome = imgEl?.alt?.trim() || ''

      // Se não encontrou no alt, procurar em elementos de texto
      if (!nome) {
        const nomeEl = card.querySelector('.pdp-link, .product-name, [class*="product-name"], h3, .name')
        nome = nomeEl?.textContent?.trim() || nomeEl?.title?.trim() || ''
      }

      // Se ainda não encontrou, tentar pegar do data-gtm-info
      if (!nome) {
        const gtmInfo = card.getAttribute('data-gtm-info')
        if (gtmInfo) {
          try {
            const gtmData = JSON.parse(gtmInfo)
            nome = gtmData.items?.[0]?.item_name || ''
          } catch (e) {}
        }
      }

      // Preço
      const precoEl = card.querySelector('.sales, .sales-price, .price, [class*="price"]')
      const precoTexto = precoEl?.textContent?.trim() || ''

      // Quantidade (do product-unit)
      const qtyEl = card.querySelector('.product-unit')
      let quantidade = qtyEl?.textContent?.trim() || ''
      // Extrair só a primeira parte (antes do |)
      if (quantidade.includes('|')) {
        quantidade = quantidade.split('|')[0].trim()
      }

      // Marca
      const marcaEl = card.querySelector('.product-brand, [class*="brand"], .brand')
      const marca = marcaEl?.textContent?.trim() || ''

      // Imagem do produto (imgEl já foi declarado acima)
      const imagem = imgEl ? (imgEl.src || imgEl.dataset.src || imgEl.getAttribute('data-src') || '') : ''

      // URL do produto
      const linkEl = card.querySelector('a[href]')
      let url = linkEl?.href || ''
      if (url && !url.startsWith('http')) {
        url = 'https://www.pingodoce.pt' + url
      }

      return {
        nome,
        precoTexto,
        quantidade,
        marca,
        imagem,
        url,
        debug: {
          totalCards: cards.length,
          cardClassName: card?.className,
          imgAlt: imgEl?.alt?.substring(0, 100),
          precoElTag: precoEl?.tagName,
          precoElTextContent: precoEl?.textContent?.substring(0, 50)
        }
      }
    })

    console.log('DEBUG:', JSON.stringify(produto?.debug, null, 2))

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
      supermercado: 'Pingo Doce',
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
  scrapePingoDoce(query)
    .then(result => {
      console.log('\n' + '='.repeat(60))
      console.log('RESULTADO:')
      console.log(JSON.stringify(result, null, 2))
    })
    .catch(console.error)
}

module.exports = { scrapePingoDoce }
