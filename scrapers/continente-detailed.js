const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Produtos para fazer scraping detalhado
const searchTerms = [
  'leite mimosa meio gordo',
  'arroz agulha',
  'ovos frescos',
  'azeite virgem extra',
  'massa esparguete',
  'agua natural',
  'cafe delta',
  'acucar branco',
  'farinha tipo 65',
  'manteiga',
  'batatas',
  'tomate',
  'cebolas',
  'pao',
  'queijo',
  'fiambre',
  'iogurte',
  'frango',
  'carne picada',
  'salmao'
]

function extractPrice(text) {
  if (!text) return null
  const cleaned = text.replace(/\s/g, '')
  const match = cleaned.match(/(\d+)[,.](\d+)/)
  if (match) {
    return parseFloat(`${match[1]}.${match[2]}`)
  }
  return null
}

function normalizeProductName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 30)
}

async function scrapeProductDetails(page, searchTerm) {
  try {
    console.log(`\n📦 Pesquisando: "${searchTerm}"`)

    const searchUrl = `https://www.continente.pt/pesquisa/?q=${encodeURIComponent(searchTerm)}`
    await page.goto(searchUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    })

    await sleep(3000)

    // Extrair dados do primeiro produto
    const productData = await page.evaluate(() => {
      // Procurar o primeiro tile/card de produto
      const productTile = document.querySelector('[class*="product-tile"], [class*="pwc-tile"], [data-product]')

      if (!productTile) return null

      // Nome do produto
      const nameEl = productTile.querySelector('[class*="name"], h3, [class*="title"], .product-name')
      const name = nameEl ? nameEl.textContent.trim() : ''

      // Preço
      const priceEl = productTile.querySelector('.pwc-tile--price-primary, [class*="price"]')
      const price = priceEl ? priceEl.textContent.trim() : ''

      // Imagem
      const imgEl = productTile.querySelector('img')
      const image = imgEl ? (imgEl.src || imgEl.dataset.src || imgEl.getAttribute('data-lazy-src')) : ''

      // Quantidade/embalagem
      const qtyEl = productTile.querySelector('[class*="quantity"], [class*="weight"], [class*="unit"]')
      const quantity = qtyEl ? qtyEl.textContent.trim() : ''

      // Marca
      const brandEl = productTile.querySelector('[class*="brand"]')
      const brand = brandEl ? brandEl.textContent.trim() : ''

      // Preço por unidade (kg, lt, etc)
      const unitPriceEl = productTile.querySelector('[class*="unit-price"], [class*="price-per"]')
      const unitPrice = unitPriceEl ? unitPriceEl.textContent.trim() : ''

      return {
        name,
        price,
        image,
        quantity,
        brand,
        unitPrice
      }
    })

    if (!productData || !productData.name) {
      console.log(`  ✗ Produto não encontrado`)
      return null
    }

    const priceValue = extractPrice(productData.price)

    if (!priceValue || priceValue <= 0) {
      console.log(`  ✗ Preço inválido`)
      return null
    }

    console.log(`  ✓ ${productData.name}`)
    console.log(`    Preço: €${priceValue.toFixed(2)}`)
    console.log(`    Quantidade: ${productData.quantity || 'N/A'}`)
    console.log(`    Marca: ${productData.brand || 'N/A'}`)
    console.log(`    Imagem: ${productData.image ? 'Sim' : 'Não'}`)

    return {
      searchTerm,
      name: productData.name,
      price: priceValue,
      quantity: productData.quantity || '',
      brand: productData.brand || '',
      unitPrice: productData.unitPrice || '',
      image: productData.image || '',
      slug: normalizeProductName(productData.name)
    }

  } catch (e) {
    console.log(`  ✗ Erro: ${e.message.substring(0, 50)}`)
    return null
  }
}

async function main() {
  console.log('🕷️  SCRAPING DETALHADO - CONTINENTE\n')
  console.log('⏱️  Isto pode demorar 3-5 minutos...\n')
  console.log('📊  A obter informação completa de cada produto...\n')

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')
  await page.setViewport({ width: 1920, height: 1080 })

  const products = []

  for (const searchTerm of searchTerms) {
    const productData = await scrapeProductDetails(page, searchTerm)

    if (productData) {
      products.push(productData)
    }

    await sleep(2000) // Delay entre produtos
  }

  await browser.close()

  // Guardar
  const outputPath = path.join(__dirname, '../data/products-detailed.json')
  fs.writeFileSync(outputPath, JSON.stringify(products, null, 2))

  console.log(`\n✅ Scraping completo!`)
  console.log(`📄 Produtos guardados em: ${outputPath}`)
  console.log(`📊 Total: ${products.length} produtos com informação detalhada\n`)

  // Resumo
  console.log('📋 Produtos obtidos:')
  products.forEach((p, i) => {
    console.log(`  ${(i + 1).toString().padStart(2)}. ${p.name.substring(0, 50).padEnd(50)} → €${p.price.toFixed(2)}`)
  })

  console.log(`\n✨ Informação obtida por produto:`)
  console.log(`   - Nome completo`)
  console.log(`   - Preço`)
  console.log(`   - Quantidade/Embalagem`)
  console.log(`   - Marca`)
  console.log(`   - Imagem`)
  console.log(`   - Preço por unidade`)
}

main().catch(console.error)
