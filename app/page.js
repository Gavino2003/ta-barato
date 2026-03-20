"use client"

import { useMemo, useState } from 'react'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [produto, setProduto] = useState(null)
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

  const maisBarato = produto ? supermercados.find((s) => s.key === produto.maisBarato) : null

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
    <main className="min-h-screen">
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-transparent to-white/30" />
      <section className="relative z-10 mx-auto max-w-6xl px-4 pt-5 pb-12 sm:px-5 sm:pt-8 sm:pb-16">
        <header className="mb-4">
          <p className="m-0 text-[11px] font-bold tracking-[0.13em] text-[#607065]">COMPARADOR PT</p>
          <h1 className="m-0 mt-1 text-[clamp(2rem,9vw,3.8rem)] leading-[0.95] font-extrabold [font-family:var(--font-heading)]">TáBarato</h1>
          <p className="mt-2 max-w-[40ch] text-[#607065]">Compara preços reais entre Continente, Pingo Doce e Minipreço.</p>
        </header>

        <form onSubmit={handleSearch} className="grid gap-2 rounded-2xl border border-[#d9ddd7] bg-white p-4 shadow-[0_10px_24px_rgba(42,57,50,0.08)]">
          <label htmlFor="product-search" className="text-xs font-bold tracking-[0.08em] text-[#607065] uppercase">Produto</label>
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
            <input
              id="product-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ex: arroz carolino, leite magro, azeite"
              disabled={isLoading}
              className="min-w-0 w-full max-w-full rounded-xl border border-[#d9ddd7] bg-[#fbfcfa] px-4 py-3 text-base outline-none focus:border-[#7ca697] focus:ring-2 focus:ring-[#7ca697]"
            />
            <button
              type="submit"
              disabled={isLoading || !searchQuery.trim()}
              className="rounded-xl bg-gradient-to-br from-[#315f53] to-[#1f3f36] px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[136px]"
            >
              {isLoading ? 'A comparar...' : 'Comparar'}
            </button>
          </div>
          {isLoading && <p className="m-0 text-sm text-[#4d6157]">A recolher preços em paralelo. Normalmente demora 10-25s.</p>}
          {error && <p className="m-0 text-sm text-[#a32020]">{error}</p>}
        </form>

        {!produto && !isLoading && !error && (
          <section className="mt-3 rounded-2xl border border-[#d9ddd7] bg-[#eef3ef] p-4 text-[#4f6258]">
            Escreve um produto e carrega em Comparar para veres os preços.
          </section>
        )}

        {produto?.produtosSemelhantes === false && (
          <section className="mt-3 rounded-2xl border border-[#f1d494] bg-[#fff4d8] p-4 text-[#77520b]">
            Os produtos encontrados parecem diferentes entre lojas. Refina a pesquisa para comparação mais justa.
          </section>
        )}

        {maisBarato && (
          <section className="mt-4 flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-[#d9ddd7] bg-gradient-to-br from-[#ebf3ef] to-[#f5f7f2] p-4">
            <div>
              <p className="m-0 text-xs text-[#607065]">Melhor preço</p>
              <h2 className="my-1 text-2xl font-bold">{maisBarato.nome}</h2>
              <p className="m-0 text-4xl font-extrabold">€{maisBarato.dados.preco.toFixed(2)}</p>
            </div>
            <div className="text-right text-[#30453d]">
              <p className="m-0 text-xs">Poupança máxima</p>
              <strong className="block text-xl">€{diferenca.toFixed(2)}</strong>
              <span className="text-sm">{percentagem}%</span>
            </div>
          </section>
        )}

        {produto && (
          <>
            <section className="mt-4 rounded-2xl border border-[#d9ddd7] bg-white p-4">
              <span className="inline-block rounded-full bg-[#ebefea] px-2.5 py-1 text-xs text-[#556459]">{produto.categoria}</span>
              <h3 className="mt-2 text-[clamp(1.25rem,4.8vw,2rem)] font-semibold">{produto.produto}</h3>
            </section>

            <section className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {supermercados.map((supermercado) => {
                const ehMaisBarato = supermercado.key === produto.maisBarato
                const precoGap = supermercado.dados.preco - precoMinimo

                return (
                  <article
                    key={supermercado.key}
                    className={`overflow-hidden rounded-3xl border bg-white shadow-[0_8px_20px_rgba(41,55,48,0.06)] ${ehMaisBarato ? 'border-[#7aa793] shadow-[0_12px_25px_rgba(49,95,83,0.18)]' : 'border-[#d9ddd7]'}`}
                  >
                    <div
                      className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d9ddd7] px-4 py-3"
                      style={{ backgroundColor: `${supermercado.cor}22` }}
                    >
                      <h4 className="m-0 text-xl font-bold">{supermercado.nome}</h4>
                      {ehMaisBarato ? (
                        <span className="rounded-full bg-[#1f3f36] px-2.5 py-1 text-xs font-medium text-white">Mais barato</span>
                      ) : (
                        <span className="text-sm text-[#526158]">+€{precoGap.toFixed(2)}</span>
                      )}
                    </div>

                    <div className="grid h-[clamp(170px,24vw,250px)] min-h-[170px] w-full place-items-center border-b border-[#d9ddd7] bg-[#f8faf8] p-2 sm:h-[clamp(190px,18vw,260px)] sm:min-h-[190px] overflow-hidden">
                      {supermercado.dados.imagem ? (
                        <img
                          src={normalizeImageUrl(supermercado.dados.imagem)}
                          alt={supermercado.dados.nome}
                          className="max-h-full w-auto max-w-full object-contain"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            const fallback = e.currentTarget.parentElement?.querySelector('[data-fallback]')
                            if (fallback) fallback.style.display = 'grid'
                          }}
                        />
                      ) : null}
                      <div
                        className="h-full w-full place-items-center bg-[repeating-linear-gradient(-45deg,#f3f5f2,#f3f5f2_8px,#edf0ec_8px,#edf0ec_16px)] text-sm text-[#6b7b71]"
                        data-fallback
                        style={{ display: supermercado.dados.imagem ? 'none' : 'grid' }}
                      >
                        Sem imagem
                      </div>
                    </div>

                    <div className="min-w-0 p-4">
                      <p className="m-0 text-5xl leading-none font-extrabold">€{supermercado.dados.preco.toFixed(2)}</p>
                      <p className="mt-2 text-[1.1rem] text-[#607065]">{supermercado.dados.quantidade || 'Quantidade não disponível'}</p>
                      <p className="mt-2 break-words text-lg text-[#2d382f]">{supermercado.dados.nome}</p>
                      {supermercado.dados.url && (
                        <a
                          href={supermercado.dados.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-block text-base font-bold text-[#174c3d]"
                        >
                          Ver no supermercado
                        </a>
                      )}
                    </div>
                  </article>
                )
              })}
            </section>
          </>
        )}
      </section>
    </main>
  )
}
