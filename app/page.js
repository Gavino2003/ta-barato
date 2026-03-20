"use client"

import { useMemo, useState } from 'react'
import comparacaoData from '../data/comparacao.json'
import styles from './page.module.css'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [produto, setProduto] = useState(comparacaoData[0])
  const [error, setError] = useState(null)

  const coresSupermercados = {
    continente: { nome: 'Continente', cor: '#e30613' },
    pingodoce: { nome: 'Pingo Doce', cor: '#00a650' },
    minipreco: { nome: 'Minipreço', cor: '#ff9900' }
  }

  const supermercados = useMemo(() => {
    if (!produto?.precos) return []

    return Object.keys(produto.precos)
      .map((key) => ({
        key,
        nome: coresSupermercados[key]?.nome || key,
        cor: coresSupermercados[key]?.cor || '#666',
        dados: produto.precos[key]
      }))
      .filter((item) => item.dados)
      .sort((a, b) => a.dados.preco - b.dados.preco)
  }, [produto])

  const maisBarato = supermercados.find((s) => s.key === produto.maisBarato)

  const precos = supermercados.map((s) => s.dados.preco)
  const precoMinimo = precos.length ? Math.min(...precos) : 0
  const precoMaximo = precos.length ? Math.max(...precos) : 0
  const diferenca = precoMaximo - precoMinimo
  const percentagem = precoMaximo > 0 ? ((diferenca / precoMaximo) * 100).toFixed(1) : '0.0'

  const normalizeImageUrl = (url) => {
    if (!url) return ''
    if (url.startsWith('//')) return `https:${url}`
    return url
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setProduto(data)
      }
    } catch {
      setError('Erro ao pesquisar. Tenta novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.backgroundGlow} />
      <section className={styles.container}>
        <header className={styles.hero}>
          <p className={styles.kicker}>COMPARADOR PT</p>
          <h1 className={styles.title}>TáBarato</h1>
          <p className={styles.subtitle}>Compara preços reais entre Continente, Pingo Doce e Minipreço.</p>
        </header>

        <form onSubmit={handleSearch} className={styles.searchCard}>
          <label htmlFor="product-search" className={styles.label}>Produto</label>
          <div className={styles.searchRow}>
            <input
              id="product-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ex: arroz carolino, leite magro, azeite"
              disabled={isLoading}
              className={styles.input}
            />
            <button type="submit" disabled={isLoading || !searchQuery.trim()} className={styles.button}>
              {isLoading ? 'A comparar...' : 'Comparar'}
            </button>
          </div>
          {isLoading && <p className={styles.info}>A recolher preços em paralelo. Normalmente demora 10-25s.</p>}
          {error && <p className={styles.error}>{error}</p>}
        </form>

        {produto?.produtosSemelhantes === false && (
          <section className={styles.warning}>
            Os produtos encontrados parecem diferentes entre lojas. Refina a pesquisa para comparação mais justa.
          </section>
        )}

        {maisBarato && (
          <section className={styles.highlight}>
            <div>
              <p className={styles.highlightLabel}>Melhor preço</p>
              <h2 className={styles.highlightStore}>{maisBarato.nome}</h2>
              <p className={styles.highlightPrice}>€{maisBarato.dados.preco.toFixed(2)}</p>
            </div>
            <div className={styles.savingsBox}>
              <p>Poupança máxima</p>
              <strong>€{diferenca.toFixed(2)}</strong>
              <span>{percentagem}%</span>
            </div>
          </section>
        )}

        <section className={styles.productMeta}>
          <span>{produto.categoria}</span>
          <h3>{produto.produto}</h3>
        </section>

        <section className={styles.grid}>
          {supermercados.map((supermercado) => {
            const ehMaisBarato = supermercado.key === produto.maisBarato
            const precoGap = supermercado.dados.preco - precoMinimo

            return (
              <article key={supermercado.key} className={styles.card} data-best={ehMaisBarato ? 'true' : 'false'}>
                <div className={styles.cardHeader} style={{ '--brand': supermercado.cor }}>
                  <h4>{supermercado.nome}</h4>
                  {ehMaisBarato ? <span className={styles.bestBadge}>Mais barato</span> : <span>+€{precoGap.toFixed(2)}</span>}
                </div>

                <div className={styles.imageWrap}>
                  {supermercado.dados.imagem ? (
                    <img
                      src={normalizeImageUrl(supermercado.dados.imagem)}
                      alt={supermercado.dados.nome}
                      className={styles.image}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        const fallback = e.currentTarget.parentElement?.querySelector('[data-fallback]')
                        if (fallback) fallback.style.display = 'grid'
                      }}
                    />
                  ) : null}
                  <div className={styles.imageFallback} data-fallback style={{ display: supermercado.dados.imagem ? 'none' : 'grid' }}>
                    Sem imagem
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <p className={styles.price}>€{supermercado.dados.preco.toFixed(2)}</p>
                  <p className={styles.qty}>{supermercado.dados.quantidade || 'Quantidade não disponível'}</p>
                  <p className={styles.name}>{supermercado.dados.nome}</p>
                  {supermercado.dados.url && (
                    <a href={supermercado.dados.url} target="_blank" rel="noopener noreferrer" className={styles.link}>
                      Ver no supermercado
                    </a>
                  )}
                </div>
              </article>
            )
          })}
        </section>
      </section>
    </main>
  )
}
