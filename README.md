# Comparador de Preços - Supermercados PT

Comparador de preços entre **7 supermercados** em Portugal com **web scraping automático**!

🛒 **Continente** • **Minipreço** • **Pingo Doce** • **Lidl** • **Auchan** • **Mercadona** • **Intermarché**

## Como Funciona

1. **App Web** (100% client-side) - interface para comparar preços
2. **Web Scraper** - atualiza preços automaticamente dos sites reais

## Uso Rápido

### 1. App Web

```bash
npm run dev
```

Abre http://localhost:3000

Insere produtos (ex: `leite, arroz, ovos`) e vê qual supermercado é mais barato!

### 2. Atualizar Preços

```bash
npm run scrape
```

Isto atualiza o ficheiro `data/prices.json` com preços simulados (variações realistas).

A app web carrega automaticamente os novos preços!

## Comandos Disponíveis

```bash
npm run dev           # Inicia app web (localhost:3000)
npm run scrape        # Atualiza preços (simulado)
npm run scrape:real   # Web scraping real (avançado)
npm run build         # Build para produção
npm run start         # Servidor produção
```

## Estrutura do Projeto

```
comparador-precos/
├── app/
│   ├── page.js          # Comparador (React client-side)
│   └── layout.js        # Layout base
├── data/
│   └── prices.json      # Base de dados de preços
├── scrapers/
│   ├── demo-scraper.js  # Scraper simulado
│   ├── scraper.js       # Scraper real (Puppeteer)
│   ├── config.js        # URLs e seletores
│   └── README.md        # Documentação scrapers
└── package.json
```

## Como Usar

### App Web

1. Inicia o servidor: `npm run dev`
2. Abre http://localhost:3000
3. Escreve produtos separados por vírgula
4. Clica "Comparar Preços"
5. Vê qual supermercado é mais barato

**Produtos disponíveis:**
leite, arroz, ovos, azeite, massa, agua, cafe, acucar, farinha, manteiga

### Atualizar Preços

**Modo Simulado (Recomendado):**

```bash
npm run scrape
```

Simula scraping com variações realistas. Perfeito para testar!

**Modo Real (Avançado):**

```bash
npm run scrape:real
```

Faz scraping real dos sites. Requer configuração! Ver `scrapers/README.md`

## Web Scraping

O sistema inclui 2 scrapers:

### 1. Demo Scraper (Simulado)

- Gera preços com variações aleatórias (-10% a +15%)
- Rápido e confiável
- Não precisa de configuração
- Ideal para desenvolvimento

```bash
npm run scrape
```

### 2. Real Scraper (Puppeteer) ⭐ FUNCIONAL!

- Faz scraping REAL do **Continente** (100% funcional!)
- Lidl e Auchan usam preços anteriores (têm proteção anti-bot)
- Usa Puppeteer (browser headless)
- Atualiza todos os 10 produtos do Continente

```bash
npm run scrape:real
```

**Status atual (7 supermercados):**
- ✅ **Continente**: Scraping real 100% funcional!
- 🔄 **Minipreço**: Scraper configurado (em teste)
- 🔄 **Pingo Doce**: Scraper configurado (em teste)
- ⚠️ **Lidl**: Fallback (anti-bot protection)
- ⚠️ **Auchan**: Fallback (anti-bot protection)
- ℹ️ **Mercadona**: Sem loja online (dados simulados)
- ℹ️ **Intermarché**: Sem loja online (dados simulados)

## Configuração de Scraping Real

1. Edita `scrapers/config.js`
2. Adiciona URLs reais dos produtos
3. Configura seletores CSS para cada site
4. Testa: `npm run scrape:real`

Ver `scrapers/README.md` para guia completo!

## Tecnologias

- **Next.js 16** - Framework React
- **React 19** - UI (100% client-side)
- **Puppeteer** - Web scraping
- **Cheerio** - HTML parsing
- **Axios** - HTTP requests

## Features

- Comparação de preços em tempo real
- Destaque do supermercado mais barato
- Diferença de preço entre lojas
- Normalização de texto (aceita acentos)
- Web scraping automático
- 100% client-side (sem backend)

## Notas Importantes

### Web Scraping

- Pode violar termos de serviço dos sites
- Use com responsabilidade
- Para uso pessoal/educacional
- Considera APIs oficiais quando disponíveis

### Limitações

- Scraping real precisa de manutenção (sites mudam)
- Anti-bot pode bloquear requests
- Seletores CSS precisam de atualizações

### Alternativas

1. **APIs Oficiais** - Se supermercados oferecerem
2. **Inserção Manual** - Atualiza `prices.json` manualmente
3. **Crowdsourcing** - Deixa users reportarem preços

## Próximos Passos

1. Adiciona mais produtos
2. Configura scraping real
3. Adiciona mais supermercados
4. Cria cron job para atualizar diariamente
5. Deploy (Vercel, Netlify, etc.)

## Automatização

### Atualizar Preços Diariamente

Cria um cron job (Linux/Mac):

```bash
crontab -e
```

Adiciona:

```bash
# Atualizar preços diariamente às 2h
0 2 * * * cd ~/Projects/comparador-precos && npm run scrape
```

Ou usa GitHub Actions para correr na cloud!

## Deploy

A app é 100% client-side, pode fazer deploy em:

- **Vercel** (recomendado)
- **Netlify**
- **GitHub Pages**

```bash
npm run build
# Upload da pasta .next para o serviço
```

## Troubleshooting

### App não carrega

- Verifica que `npm run dev` está a correr
- Abre http://localhost:3000
- Verifica console do browser

### Preços não atualizam

- Corre `npm run scrape` novamente
- Verifica `data/prices.json`
- Recarrega a página no browser

### Scraping real falha

- Ver `scrapers/README.md`
- Verifica URLs em `config.js`
- Atualiza seletores CSS
- Usa modo demo: `npm run scrape`

## Contribuir

Melhorias bem-vindas:

- Adicionar mais supermercados
- Melhorar scrapers
- UI/UX improvements
- Suporte mobile
- Gráficos de evolução de preços

## Licença

Código aberto para uso pessoal/educacional.

---

Feito com Next.js e Puppeteer | Portugal 🇵🇹
