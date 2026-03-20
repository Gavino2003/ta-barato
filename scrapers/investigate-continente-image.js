const puppeteer = require('puppeteer')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function investigateContinenteImage() {
  console.log('\n🔍 INVESTIGAR IMAGEM DO CONTINENTE')
  console.log('='.repeat(60))

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')
  await page.setViewport({ width: 1920, height: 1080 })

  try {
    const url = 'https://www.continente.pt/pesquisa/?q=massa%20esparguete'
    console.log(`\n📍 URL: ${url}`)

    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    })

    await sleep(3000)
    console.log('✓ Página carregada')

    // Investigar estrutura do card
    const investigacao = await page.evaluate(() => {
      const card = document.querySelector('.productTile, .product-tile')

      if (!card) return { erro: 'Card não encontrado' }

      // Obter TODAS as imagens dentro do card
      const todasImgs = Array.from(card.querySelectorAll('img'))

      return {
        totalImagens: todasImgs.length,
        imagens: todasImgs.map((img, index) => ({
          index,
          tagName: img.tagName,
          className: img.className,
          id: img.id,
          src: img.src,
          dataSrc: img.dataset?.src || img.getAttribute('data-src'),
          srcset: img.srcset,
          alt: img.alt,
          width: img.width,
          height: img.height,
          parentClass: img.parentElement?.className || '',
          parentTagName: img.parentElement?.tagName || ''
        })),
        htmlStructure: card.innerHTML.substring(0, 500) // Primeiros 500 chars do HTML
      }
    })

    console.log('\n📊 INVESTIGAÇÃO:')
    console.log(JSON.stringify(investigacao, null, 2))

    console.log('\n💡 Deixa o browser aberto para investigares...')
    console.log('Press Ctrl+C para fechar.')

    // Deixar aberto para investigação manual
    // await browser.close()

  } catch (e) {
    console.log(`✗ ERRO: ${e.message}`)
    await browser.close()
  }
}

investigateContinenteImage()
  .catch(console.error)
