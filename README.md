# 🛒 TáBarato

**O teu comparador de preços tuga!** Encontra os produtos mais baratos entre supermercados portugueses.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black)](https://nextjs.org/)
[![Puppeteer](https://img.shields.io/badge/Puppeteer-24.40-green)](https://pptr.dev/)

## ✨ Funcionalidades

- 🔍 **Pesquisa em tempo real** - Procura produtos nos 3 supermercados simultaneamente
- 🧠 **Análise inteligente** - Deteta automaticamente se os produtos são comparáveis
- 💰 **Poupanças calculadas** - Mostra quanto poupas comprando no mais barato
- 📱 **Interface responsiva** - Funciona em desktop e mobile
- 🖼️ **Imagens dos produtos** - Vê os produtos antes de comprar

## 🏪 Supermercados Suportados

✅ **Continente** - Scraping direto do site
✅ **Pingo Doce** - Scraping direto do site
✅ **Minipreço** - Scraping direto do site

## 🚀 Deploy no Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/[teu-username]/tabarato)

> **Nota**: Os scrapers usam Puppeteer que pode não funcionar no Vercel (serverless). Para usar scrapers, executa localmente.

## 💻 Desenvolvimento Local

### 1. Instalar dependências
```bash
npm install
```

### 2. Executar interface web
```bash
npm run dev
```
Abre http://localhost:3000

### 3. Comparar preços via CLI
```bash
# Comparação inteligente (recomendado)
node scrapers/compare-product-smart.js "massa esparguete"

# Comparação simples
node scrapers/compare-product.js "leite"
```

## 📦 Exemplos de Pesquisa

```bash
# Produtos específicos funcionam melhor
node scrapers/compare-product-smart.js "massa esparguete"     # ✅ Bom
node scrapers/compare-product-smart.js "leite magro mimosa"   # ✅ Bom
node scrapers/compare-product-smart.js "arroz carolino"       # ✅ Bom

# Produtos genéricos podem dar resultados diferentes
node scrapers/compare-product-smart.js "farinha"              # ⚠️ Produtos diferentes
```

## 🛠️ Tecnologias

- **Next.js 16** - Framework React com App Router
- **Puppeteer** - Automação do browser para web scraping
- **Node.js** - Runtime JavaScript
- **React 19** - UI Components

## 📊 Estrutura do Projeto

```
tabarato/
├── app/
│   ├── api/compare/route.js    # API endpoint para comparação
│   ├── page.js                 # Interface principal
│   └── layout.js               # Layout da app
├── scrapers/
│   ├── continente-scraper.js   # Scraper do Continente
│   ├── pingodoce-scraper.js    # Scraper do Pingo Doce
│   ├── minipreco-scraper.js    # Scraper do Minipreço
│   ├── compare-product.js      # Comparador simples
│   └── compare-product-smart.js # Comparador inteligente
├── data/
│   └── comparacao.json         # Última comparação guardada
└── package.json
```

## 🧠 Como Funciona a Análise Inteligente

O comparador analisa a **similaridade** entre os produtos encontrados:

```
Continente: "Massa Esparguete Milaneza"
Pingo Doce: "Massa Esparguete Pingo Doce"
Minipreço:  "AUCHAN Esparguete 500g"

Similaridade: ✅ 50-100% → Produtos comparáveis
```

Quando os produtos são muito diferentes (< 30% similaridade), mostra um aviso.

## ⚠️ Limitações

- **Scrapers podem quebrar** se os sites mudarem estrutura
- **Velocidade** - Cada pesquisa demora 30-60 segundos (scraping em 3 sites)
- **Serverless** - Puppeteer não funciona no Vercel (usa modo local)
- **Rate limiting** - Não abuses dos scrapers para evitar bloqueios

## 📝 Licença

Este projeto é apenas para fins **educacionais**. Os dados são obtidos por web scraping público.

## 🤖 Desenvolvido com Claude Code

Este projeto foi desenvolvido com [Claude Code](https://claude.com/claude-code).

---

**TáBarato** - Poupa dinheiro, compra inteligente! 🇵🇹
