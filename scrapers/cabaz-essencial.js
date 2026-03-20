const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// CABAZ ESSENCIAL PORTUGUÊS (baseado no cabaz DECO + produtos comuns)
const produtos = [
  // Alimentação Básica
  { search: 'pao forma',category: 'padaria' },
  { search: 'leite meio gordo', category: 'laticínios' },
  { search: 'ovos frescos', category: 'ovos' },
  { search: 'arroz agulha', category: 'mercearia' },
  { search: 'massa esparguete', category: 'mercearia' },
  { search: 'azeite virgem extra', category: 'mercearia' },
  { search: 'acucar branco', category: 'mercearia' },
  { search: 'sal fino', category: 'mercearia' },
  { search: 'cafe moido delta', category: 'mercearia' },
  { search: 'manteiga com sal', category: 'laticínios' },
  { search: 'queijo flamengo', category: 'laticínios' },
  { search: 'fiambre', category: 'charcutaria' },
  { search: 'iogurte natural', category: 'laticínios' },
  { search: 'farinha tipo 65', category: 'mercearia' },

  // Frutas e Vegetais
  { search: 'batatas', category: 'frutas e vegetais' },
  { search: 'tomate', category: 'frutas e vegetais' },
  { search: 'cebola', category: 'frutas e vegetais' },
  { search: 'alface', category: 'frutas e vegetais' },
  { search: 'cenoura', category: 'frutas e vegetais' },
  { search: 'banana', category: 'frutas e vegetais' },
  { search: 'maca', category: 'frutas e vegetais' },

  // Proteína
  { search: 'frango inteiro', category: 'talho' },
  { search: 'carne porco lombo', category: 'talho' },
  { search: 'carne picada vaca', category: 'talho' },
  { search: 'peixe congelado pescada', category: 'congelados' },
  { search: 'bacalhau congelado', category: 'congelados' },

  // Conservas
  { search: 'atum lata', category: 'mercearia' },
  { search: 'feijao cozido lata', category: 'mercearia' },
  { search: 'grao-de-bico cozido', category: 'mercearia' },
  { search: 'tomate polpa', category: 'mercearia' },
  { search: 'ervilhas lata', category: 'mercearia' },
  { search: 'sardinha lata', category: 'mercearia' },

  // Bebidas
  { search: 'agua mineral natural', category: 'bebidas' },
  { search: 'sumo laranja natural', category: 'bebidas' },

  // Higiene e Limpeza
  { search: 'detergente roupa skip', category: 'limpeza' },
  { search: 'detergente loica fairy', category: 'limpeza' },
  { search: 'papel higienico', category: 'higiene' },
  { search: 'sabonete dove', category: 'higiene' }
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

async function scrapeProduct(page, produto) {
  try {
    console.log(`📦 ${produto.search}...`)

    const url = `https://www.continente.pt/pesquisa/?q=${encodeURIComponent(produto.search)}`
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    })

    await sleep(2000)

    // Extrair dados do PRIMEIRO produto
    const data = await page.evaluate(() => {
      // Procurar o primeiro card de produto
      const card = document.querySelector('[class*="product"], [class*="tile"], [data-product-tile]')

      if (!card) return null

      // Nome
      const name = card.querySelector('.product-name, [class*="product-name"], h3, .ct-tile--description')?.textContent?.trim() || ''

      // Preço
      const price = card.querySelector('.pwc-tile--price-primary, [class*="price-value"], .sales-price')?.textContent?.trim() || ''

      // Quantidade
      const qty = card.querySelector('.pwc-tile--quantity, [class*="quantity"], .product-size')?.textContent?.trim() || ''

      // Imagem
      const img = card.querySelector('img')
      const image = img ? (img.src || img.dataset.src || img.getAttribute('data-src')) : ''

      // Marca (pode estar no nome)
      const brand = card.querySelector('[class*="brand"]')?.textContent?.trim() || ''

      return { name, price, qty, image, brand }
    })

    if (!data || !data.name) {
      console.log(`  ✗ Não encontrado`)
      return null
    }

    const priceValue = extractPrice(data.price)

    if (!priceValue || priceValue <= 0) {
      console.log(`  ✗ Preço inválido`)
      return null
    }

    console.log(`  ✓ ${data.name.substring(0, 50)} - €${priceValue.toFixed(2)}`)

    return {
      search: produto.search,
      category: produto.category,
      name: data.name,
      price: priceValue,
      quantity: data.qty,
      image: data.image,
      brand: data.brand
    }

  } catch (e) {
    console.log(`  ✗ Erro: ${e.message.substring(0, 40)}`)
    return null
  }
}

async function main() {
  console.log('🛒 SCRAPING CABAZ ESSENCIAL PORTUGUÊS - CONTINENTE\n')
  console.log(`📊 ${produtos.length} produtos a obter...\n`)

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')

  const results = []

  for (const produto of produtos) {
    const data = await scrapeProduct(page, produto)
    if (data) {
      results.push(data)
    }
    await sleep(1500)
  }

  await browser.close()

  // Guardar
  const outputPath = path.join(__dirname, '../data/cabaz-produtos.json')
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2))

  console.log(`\n✅ COMPLETO!`)
  console.log(`📄 ${results.length} produtos guardados em: ${outputPath}\n`)

  // Estatísticas
  const byCategory = {}
  results.forEach(p => {
    byCategory[p.category] = (byCategory[p.category] || 0) + 1
  })

  console.log('📊 Por categoria:')
  Object.entries(byCategory).forEach(([cat, count]) => {
    console.log(`  ${cat.padEnd(20)} → ${count} produtos`)
  })

  console.log(`\n💰 Gama de preços: €${Math.min(...results.map(p => p.price)).toFixed(2)} - €${Math.max(...results.map(p => p.price)).toFixed(2)}`)
}

main().catch(console.error)
