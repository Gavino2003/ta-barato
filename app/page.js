"use client"

import { useState } from 'react'
import comparacaoData from '../data/comparacao.json'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [produto, setProduto] = useState(comparacaoData[0]) // Massa esparguete
  const [error, setError] = useState(null)

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
    } catch (err) {
      setError('Erro ao pesquisar. Tenta novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  // Mapa de cores por supermercado
  const coresSupermercados = {
    continente: { nome: 'Continente', cor: '#e30613' },
    pingodoce: { nome: 'Pingo Doce', cor: '#00a650' },
    minipreco: { nome: 'Minipreço', cor: '#ff9900' }
  }

  // Construir lista dinâmica de supermercados baseado nos dados disponíveis
  const supermercados = Object.keys(produto.precos).map(key => ({
    key,
    nome: coresSupermercados[key]?.nome || key,
    cor: coresSupermercados[key]?.cor || '#666',
    dados: produto.precos[key]
  })).filter(s => s.dados) // Só incluir os que têm dados

  const maisBarato = supermercados.find(s => s.key === produto.maisBarato)

  // Calcular diferença entre o mais barato e o mais caro
  const precos = supermercados.map(s => s.dados.preco)
  const precoMinimo = Math.min(...precos)
  const precoMaximo = Math.max(...precos)
  const diferenca = precoMaximo - precoMinimo
  const percentagem = ((diferenca / precoMaximo) * 100).toFixed(1)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '30px 0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '700', margin: '0 0 10px 0' }}>
            Comparador de Preços PT
          </h1>
          <p style={{ margin: 0, fontSize: '18px', opacity: 0.95 }}>
            Dados 100% reais obtidos por web scraping
          </p>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>

        {/* Formulário de Pesquisa */}
        <form onSubmit={handleSearch} style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ex: azeite, arroz, leite..."
              disabled={isLoading}
              style={{
                flex: 1,
                minWidth: '250px',
                padding: '15px 20px',
                fontSize: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                outline: 'none',
                transition: 'border 0.3s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
            <button
              type="submit"
              disabled={isLoading || !searchQuery.trim()}
              style={{
                padding: '15px 40px',
                fontSize: '16px',
                fontWeight: '700',
                background: isLoading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                minWidth: '150px'
              }}
            >
              {isLoading ? '🔍 A pesquisar...' : '🔍 Comparar Preços'}
            </button>
          </div>
          {error && (
            <div style={{
              marginTop: '15px',
              padding: '12px 20px',
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: '8px',
              color: '#c33',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}
          {isLoading && (
            <div style={{
              marginTop: '15px',
              padding: '12px 20px',
              backgroundColor: '#e3f2fd',
              border: '1px solid #90caf9',
              borderRadius: '8px',
              color: '#1976d2',
              fontSize: '14px'
            }}>
              ⏱️ A comparar preços em Continente, Pingo Doce e Minipreço... (pode demorar 30-60 segundos)
            </div>
          )}
        </form>

        {/* Aviso de produtos diferentes */}
        {produto.produtosSemelhantes === false && (
          <div style={{
            backgroundColor: '#fff3cd',
            border: '2px solid #ffc107',
            borderRadius: '16px',
            padding: '20px 25px',
            marginBottom: '30px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '32px' }}>⚠️</div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#856404', fontSize: '18px', fontWeight: '700' }}>
                  Produtos MUITO DIFERENTES encontrados!
                </h4>
                <p style={{ margin: '0 0 10px 0', color: '#856404', fontSize: '14px', lineHeight: '1.5' }}>
                  A comparação pode não ser justa pois cada supermercado retornou produtos diferentes.
                  Considera pesquisar com mais detalhes.
                </p>
                <p style={{ margin: 0, color: '#856404', fontSize: '13px', fontStyle: 'italic' }}>
                  💡 Exemplo: em vez de "farinha", tenta "farinha trigo tipo 65"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Banner do mais barato */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '16px',
          padding: '30px',
          marginBottom: '40px',
          boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '64px' }}>🏆</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '18px', opacity: 0.9, marginBottom: '5px' }}>
                Mais Barato
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
                {maisBarato.nome}
              </h2>
              <p style={{ fontSize: '42px', fontWeight: '700', margin: 0 }}>
                €{maisBarato.dados.preco.toFixed(2)}
              </p>
            </div>
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: '20px 30px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '5px' }}>
                Poupas
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700' }}>
                €{diferenca.toFixed(2)}
              </div>
              <div style={{ fontSize: '16px', opacity: 0.9, marginTop: '5px' }}>
                ({percentagem}% desconto)
              </div>
            </div>
          </div>
        </div>

        {/* Produto */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <span style={{
              display: 'inline-block',
              backgroundColor: '#f0f0f0',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#666',
              marginBottom: '15px'
            }}>
              {produto.categoria}
            </span>
            <h3 style={{ fontSize: '28px', fontWeight: '700', color: '#333', margin: 0 }}>
              {produto.produto}
            </h3>
          </div>
        </div>

        {/* Comparação lado a lado */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          marginBottom: '40px'
        }}>
          {supermercados.map(super_mercado => {
            const ehMaisBarato = super_mercado.key === produto.maisBarato

            return (
              <div
                key={super_mercado.key}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: ehMaisBarato
                    ? '0 8px 24px rgba(0,0,0,0.15)'
                    : '0 2px 8px rgba(0,0,0,0.1)',
                  border: ehMaisBarato ? `3px solid ${super_mercado.cor}` : 'none',
                  transform: ehMaisBarato ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Header do supermercado */}
                <div style={{
                  backgroundColor: super_mercado.cor,
                  color: 'white',
                  padding: '25px',
                  position: 'relative'
                }}>
                  {ehMaisBarato && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      backgroundColor: 'rgba(255,255,255,0.3)',
                      padding: '5px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '700'
                    }}>
                      MAIS BARATO
                    </div>
                  )}
                  <h4 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    margin: '0 0 5px 0'
                  }}>
                    {super_mercado.nome}
                  </h4>
                  <p style={{
                    margin: 0,
                    opacity: 0.9,
                    fontSize: '14px'
                  }}>
                    {super_mercado.dados.marca}
                  </p>
                </div>

                {/* Conteúdo */}
                <div style={{ padding: '30px' }}>
                  {/* Imagem do produto */}
                  {super_mercado.dados.imagem && (
                    <div style={{
                      marginBottom: '20px',
                      textAlign: 'center',
                      height: '200px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f9f9f9',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}>
                      <img
                        src={super_mercado.dados.imagem}
                        alt={super_mercado.dados.nome}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain'
                        }}
                      />
                    </div>
                  )}

                  {/* Preço grande */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{
                      fontSize: '48px',
                      fontWeight: '700',
                      color: super_mercado.cor,
                      lineHeight: 1
                    }}>
                      €{super_mercado.dados.preco.toFixed(2)}
                    </div>
                    <div style={{
                      fontSize: '16px',
                      color: '#888',
                      marginTop: '8px'
                    }}>
                      {super_mercado.dados.quantidade}
                    </div>
                  </div>

                  {/* Diferença de preço */}
                  {!ehMaisBarato && (
                    <div style={{
                      backgroundColor: '#fff3cd',
                      border: '1px solid #ffc107',
                      borderRadius: '8px',
                      padding: '12px',
                      marginTop: '15px'
                    }}>
                      <div style={{ fontSize: '14px', color: '#856404', fontWeight: '600' }}>
                        +€{diferenca.toFixed(2)} mais caro
                      </div>
                      <div style={{ fontSize: '12px', color: '#856404', marginTop: '3px' }}>
                        ({percentagem}% diferença)
                      </div>
                    </div>
                  )}

                  {ehMaisBarato && (
                    <div style={{
                      backgroundColor: '#d4edda',
                      border: '1px solid #28a745',
                      borderRadius: '8px',
                      padding: '12px',
                      marginTop: '15px'
                    }}>
                      <div style={{ fontSize: '14px', color: '#155724', fontWeight: '600' }}>
                        ✓ Melhor preço!
                      </div>
                    </div>
                  )}

                  {/* Link para o produto */}
                  {super_mercado.dados.url && (
                    <a
                      href={super_mercado.dados.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'block',
                        marginTop: '15px',
                        padding: '12px',
                        backgroundColor: super_mercado.cor,
                        color: 'white',
                        textAlign: 'center',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '14px',
                        transition: 'opacity 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.opacity = '0.85'}
                      onMouseOut={(e) => e.target.style.opacity = '1'}
                    >
                      Ver Produto →
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Info footer */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          color: '#666',
          fontSize: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0 0 8px 0' }}>
            ✓ Preços obtidos por web scraping em tempo real
          </p>
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.7 }}>
            100% dados reais • Sem informação fictícia
          </p>
        </div>
      </div>
    </div>
  )
}
