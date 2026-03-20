const { scrapeContinente } = require('./continente-scraper')
const { scrapePingoDoce } = require('./pingodoce-scraper')
const { scrapeMinipeco } = require('./minipreco-scraper')
const fs = require('fs')
const path = require('path')

function isServerlessRuntime() {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)
}

function withTimeout(promise, ms, label) {
  let timer
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => {
      console.log(`⏱️ ${label} excedeu ${ms}ms e foi ignorado para manter a API rápida.`)
      resolve(null)
    }, ms)
  })

  return Promise.race([
    promise
      .then((value) => value)
      .catch((err) => {
        console.log(`⚠️ ${label} falhou: ${err.message}`)
        return null
      })
      .finally(() => clearTimeout(timer)),
    timeout
  ])
}

// Função para calcular similaridade entre dois textos (0 a 1)
function calcularSimilaridade(texto1, texto2) {
  const t1 = texto1.toLowerCase().trim()
  const t2 = texto2.toLowerCase().trim()

  // Palavras em comum
  const palavras1 = new Set(t1.split(/\s+/))
  const palavras2 = new Set(t2.split(/\s+/))

  let comuns = 0
  palavras1.forEach(p => {
    if (palavras2.has(p)) comuns++
  })

  const total = Math.max(palavras1.size, palavras2.size)
  return comuns / total
}

// Normalizar nome do produto (remover palavras genéricas)
function normalizarNome(nome) {
  return nome
    .toLowerCase()
    .replace(/\d+\s*(kg|g|l|ml|unid|un|emb\.?)/gi, '') // remover quantidades
    .replace(/\b(pingo doce|continente|auchan|milaneza|nacional)\b/gi, '') // remover marcas
    .trim()
}

async function compareProductSmart(searchQuery) {
  const scraperTimeoutMs = Number(process.env.SCRAPER_TIMEOUT_MS || (isServerlessRuntime() ? 30000 : 35000))

  console.log(`\n🔍 COMPARADOR INTELIGENTE - ${searchQuery}`)
  console.log('='.repeat(80))
  console.log('\n🚀 A executar scrapers em PARALELO...\n')

  // Executar os 3 scrapers em paralelo
  const results = await Promise.allSettled([
    withTimeout(scrapeContinente(searchQuery), scraperTimeoutMs, 'Continente'),
    withTimeout(scrapePingoDoce(searchQuery), scraperTimeoutMs, 'Pingo Doce'),
    withTimeout(scrapeMinipeco(searchQuery), scraperTimeoutMs, 'Minipreço')
  ])

  console.log('\n' + '='.repeat(80))
  console.log('📊 ANÁLISE DE COMPATIBILIDADE')
  console.log('='.repeat(80) + '\n')

  // Processar resultados
  const produtos = {}
  const encontrados = []
  const names = ['Continente', 'Pingo Doce', 'Minipreço']
  const keys = ['continente', 'pingodoce', 'minipreco']

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value) {
      const data = result.value

      produtos[keys[index]] = {
        preco: data.preco,
        quantidade: data.quantidade,
        marca: data.marca,
        nome: data.nome,
        imagem: data.imagem,
        url: data.url
      }

      encontrados.push({
        key: keys[index],
        nome: names[index],
        produto: data.nome,
        preco: data.preco,
        normalizado: normalizarNome(data.nome)
      })

      console.log(`✅ ${names[index]}: ${data.nome}`)
      console.log(`   Preço: €${data.preco.toFixed(2)} | ${data.quantidade}`)
    } else {
      console.log(`❌ ${names[index]}: Não encontrado`)
    }
  })

  if (encontrados.length === 0) {
    console.log('\n❌ FALHA TOTAL - Nenhum preço encontrado')
    return null
  }

  // Calcular similaridade entre os produtos
  console.log('\n' + '='.repeat(80))
  console.log('🔬 ANÁLISE DE SIMILARIDADE')
  console.log('='.repeat(80) + '\n')

  if (encontrados.length >= 2) {
    for (let i = 0; i < encontrados.length; i++) {
      for (let j = i + 1; j < encontrados.length; j++) {
        const sim = calcularSimilaridade(
          encontrados[i].normalizado,
          encontrados[j].normalizado
        )
        const porcentagem = (sim * 100).toFixed(0)
        const icone = sim >= 0.5 ? '✅' : sim >= 0.3 ? '⚠️' : '❌'

        console.log(`${icone} ${encontrados[i].nome} ↔ ${encontrados[j].nome}: ${porcentagem}% semelhantes`)
      }
    }
  }

  // Avisar se os produtos são muito diferentes
  let produtosSemelhantes = true
  if (encontrados.length === 3) {
    const sim1 = calcularSimilaridade(encontrados[0].normalizado, encontrados[1].normalizado)
    const sim2 = calcularSimilaridade(encontrados[0].normalizado, encontrados[2].normalizado)
    const sim3 = calcularSimilaridade(encontrados[1].normalizado, encontrados[2].normalizado)

    const mediaSimilaridade = (sim1 + sim2 + sim3) / 3

    if (mediaSimilaridade < 0.3) {
      produtosSemelhantes = false
      console.log('\n⚠️  ATENÇÃO: Os produtos encontrados são MUITO DIFERENTES!')
      console.log('   A comparação pode não ser justa. Considera pesquisar com mais detalhes.')
      console.log('   Exemplo: em vez de "farinha", tenta "farinha trigo tipo 65"\n')
    }
  }

  // Encontrar o mais barato
  const maisBarato = encontrados.reduce((min, curr) =>
    curr.preco < min.preco ? curr : min
  )

  console.log('\n' + '='.repeat(80))
  console.log(`🏆 MAIS BARATO: ${maisBarato.nome} - €${maisBarato.preco.toFixed(2)}`)
  console.log('='.repeat(80))

  // Mostrar poupanças
  console.log('\n💰 POUPANÇAS:')
  encontrados.forEach(item => {
    if (item.key !== maisBarato.key) {
      const diferenca = item.preco - maisBarato.preco
      const percentagem = ((diferenca / item.preco) * 100).toFixed(1)
      console.log(`  ${item.nome}: poupas €${diferenca.toFixed(2)} (${percentagem}%)`)
    }
  })

  // Criar objeto para guardar
  const comparacao = {
    id: 1,
    produto: searchQuery,
    categoria: "Mercearia",
    precos: produtos,
    maisBarato: maisBarato.key,
    produtosSemelhantes: produtosSemelhantes,
    dataAtualizacao: new Date().toISOString()
  }

  // Em Vercel o filesystem de /var/task e read-only, por isso nao persistimos em disco.
  if (isServerlessRuntime()) {
    console.log('\nℹ️ Ambiente serverless detetado: a comparação será devolvida via API sem escrita em disco.')
  } else {
    const outputPath = path.join(process.cwd(), 'data/comparacao.json')

    try {
      fs.writeFileSync(outputPath, JSON.stringify([comparacao], null, 2))
      console.log(`\n✅ Dados guardados em: ${outputPath}`)
    } catch (err) {
      if (err && err.code === 'EROFS') {
        console.log('\n⚠️ Sistema de ficheiros read-only: a comparação foi gerada mas não foi guardada em disco.')
      } else {
        throw err
      }
    }
  }

  console.log('\n🌐 Podes ver a comparação em: http://localhost:3000\n')

  return comparacao
}

// Se executado diretamente
if (require.main === module) {
  const query = process.argv[2] || 'massa esparguete'
  compareProductSmart(query)
    .then(() => process.exit(0))
    .catch(err => {
      console.error('❌ ERRO:', err)
      process.exit(1)
    })
}

module.exports = { compareProductSmart }
