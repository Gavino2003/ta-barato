const { scrapeContinente } = require('./continente-scraper')
const { scrapePingoDoce } = require('./pingodoce-scraper')
const { scrapeMinipeco } = require('./minipreco-scraper')
const fs = require('fs')
const path = require('path')

async function compareProduct(searchQuery) {
  console.log(`\n🔍 COMPARADOR DE PREÇOS - ${searchQuery}`)
  console.log('='.repeat(80))
  console.log('\n🚀 A executar scrapers em PARALELO para poupar tempo...\n')

  // Executar os 3 scrapers em paralelo
  const results = await Promise.allSettled([
    scrapeContinente(searchQuery),
    scrapePingoDoce(searchQuery),
    scrapeMinipeco(searchQuery)
  ])

  console.log('\n' + '='.repeat(80))
  console.log('📊 RESULTADOS FINAIS')
  console.log('='.repeat(80) + '\n')

  // Processar resultados
  const produtos = {}
  const encontrados = []

  results.forEach((result, index) => {
    const names = ['Continente', 'Pingo Doce', 'Minipreço']
    const keys = ['continente', 'pingodoce', 'minipreco']

    console.log(`${names[index]}:`)

    if (result.status === 'fulfilled' && result.value) {
      const data = result.value
      console.log(`  ✅ ${data.nome}`)
      console.log(`     Preço: €${data.preco.toFixed(2)}`)
      console.log(`     Quantidade: ${data.quantidade}`)
      console.log(`     Marca: ${data.marca}`)

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
        preco: data.preco
      })
    } else {
      console.log(`  ❌ NÃO CONSEGUI obter dados`)
      console.log(`     Erro: ${result.reason || 'desconhecido'}`)
    }
    console.log()
  })

  if (encontrados.length === 0) {
    console.log('❌ FALHA TOTAL - Não consegui nenhum preço')
    console.log('💡 Tenta verificar os sites manualmente ou ajustar os seletores')
    return null
  }

  // Encontrar o mais barato
  const maisBarato = encontrados.reduce((min, curr) =>
    curr.preco < min.preco ? curr : min
  )

  console.log('=' .repeat(80))
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
    dataAtualizacao: new Date().toISOString()
  }

  // Guardar em ficheiro
  const outputPath = path.join(__dirname, '../data/comparacao.json')
  fs.writeFileSync(outputPath, JSON.stringify([comparacao], null, 2))

  console.log(`\n✅ Dados guardados em: ${outputPath}`)
  console.log('\n🌐 Podes ver a comparação em: http://localhost:3000\n')

  return comparacao
}

// Se executado diretamente
if (require.main === module) {
  const query = process.argv[2] || 'massa esparguete'
  compareProduct(query)
    .then(() => process.exit(0))
    .catch(err => {
      console.error('❌ ERRO:', err)
      process.exit(1)
    })
}

module.exports = { compareProduct }
