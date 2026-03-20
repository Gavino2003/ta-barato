import { NextResponse } from 'next/server'
const { compareProductSmart } = require('../../../scrapers/compare-product-smart')

export async function POST(request) {
  try {
    const { query } = await request.json()

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Pesquisa vazia' }, { status: 400 })
    }

    console.log(`\n🔍 API: Comparando "${query}" com análise inteligente...`)

    // Usar o comparador inteligente
    const result = await compareProductSmart(query)

    if (!result) {
      return NextResponse.json({
        error: 'Não consegui encontrar preços. Tenta outro produto.'
      }, { status: 404 })
    }

    console.log(`✅ API: Comparação guardada com sucesso`)

    return NextResponse.json(result)

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json({
      error: 'Erro ao processar pesquisa. Tenta novamente.'
    }, { status: 500 })
  }
}
