const puppeteer = require('puppeteer')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function investigatePingoDoceV3() {
  console.log('\n🔍 INVESTIGAR PINGO DOCE V3 - Procurar por padrões de e-commerce')
  console.log('='.repeat(60))

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')
  await page.setViewport({ width: 1920, height: 1080 })

  try {
    const url = 'https://www.pingodoce.pt/pesquisa/?text=massa%20esparguete'
    console.log(`\n📍 URL: ${url}`)

    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    })

    await sleep(5000)
    console.log('✓ Página carregada')

    // Procurar por padrões de e-commerce
    const investigacao = await page.evaluate(() => {
      const resultados = {}

      // 1. Procurar elementos com preço (€, EUR, price)
      resultados.elementosComPreco = {
        euroSymbol: document.querySelectorAll('*:not(script):not(style)').length,
        precoClasses: []
      }

      const todosElementos = Array.from(document.querySelectorAll('*:not(script):not(style)'))
      const comPreco = todosElementos.filter(el => {
        const texto = el.textContent || ''
        const className = el.className?.toString().toLowerCase() || ''
        return (texto.includes('€') || className.includes('price')) && texto.length < 100
      })

      resultados.elementosComPreco.total = comPreco.length
      resultados.elementosComPreco.primeiros10 = comPreco.slice(0, 10).map(el => ({
        tagName: el.tagName,
        className: el.className,
        texto: el.textContent?.trim().substring(0, 50)
      }))

      // 2. Procurar imagens de produtos (não logos, não icons)
      const imagens = Array.from(document.querySelectorAll('img'))
      const imagensProdutos = imagens.filter(img => {
        const src = img.src || img.dataset.src || ''
        const alt = img.alt || ''
        return !src.includes('logo') &&
               !src.includes('icon') &&
               !src.includes('banner') &&
               (alt.length > 3 || src.includes('product'))
      })

      resultados.imagens = {
        total: imagens.length,
        totalProdutos: imagensProdutos.length,
        primeiras5: imagensProdutos.slice(0, 5).map(img => ({
          src: img.src?.substring(0, 80),
          alt: img.alt,
          className: img.className,
          parentClassName: img.parentElement?.className
        }))
      }

      // 3. Procurar links de produtos (href com detalhes/product/item)
      const links = Array.from(document.querySelectorAll('a[href]'))
      const linksProdutos = links.filter(a => {
        const href = a.href || ''
        return href.includes('/produto') ||
               href.includes('/product') ||
               href.includes('/item') ||
               href.includes('/p/')
      })

      resultados.links = {
        totalLinks: links.length,
        totalProdutos: linksProdutos.length,
        primeiros5: linksProdutos.slice(0, 5).map(a => ({
          href: a.href?.substring(0, 80),
          text: a.textContent?.trim().substring(0, 50),
          className: a.className
        }))
      }

      // 4. Procurar containers de grid/lista
      const possiveisContainers = document.querySelectorAll('[class*="grid"], [class*="list"], [class*="row"], [class*="container"]')
      resultados.containers = {
        total: possiveisContainers.length,
        primeiros5: Array.from(possiveisContainers).slice(0, 5).map(el => ({
          tagName: el.tagName,
          className: el.className,
          childrenCount: el.children.length,
          primeirosFilhos: Array.from(el.children).slice(0, 3).map(child => ({
            tagName: child.tagName,
            className: child.className
          }))
        }))
      }

      // 5. Dump do body para ver a estrutura geral
      resultados.bodyStructure = {
        mainDivs: Array.from(document.body.children).map(child => ({
          tagName: child.tagName,
          id: child.id,
          className: child.className,
          childrenCount: child.children.length
        }))
      }

      return resultados
    })

    console.log('\n📊 INVESTIGAÇÃO:')
    console.log(JSON.stringify(investigacao, null, 2))

    console.log('\n💡 Deixa o browser aberto para investigares...')
    console.log('Press Ctrl+C para fechar.')

  } catch (e) {
    console.log(`✗ ERRO: ${e.message}`)
    await browser.close()
  }
}

investigatePingoDoceV3()
  .catch(console.error)
