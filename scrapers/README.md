# Web Scraping - Comparador de Preços

Este sistema permite atualizar automaticamente os preços dos supermercados.

## 🚀 Uso Rápido

### Scraper de Demonstração (Recomendado para começar)

```bash
npm run scrape
```

Isto simula web scraping e atualiza os preços com variações realistas.
Perfeito para testar o sistema!

### Scraper Real (Avançado)

```bash
npm run scrape:real
```

Usa Puppeteer para fazer scraping real dos sites.
**Requer configuração dos URLs e seletores corretos!**

## 📁 Estrutura

```
scrapers/
├── demo-scraper.js    # Scraper de demonstração (simulado)
├── scraper.js         # Scraper real com Puppeteer
├── config.js          # Configuração de URLs e seletores
└── README.md          # Esta documentação
```

## ⚙️ Configuração para Scraping Real

### 1. Encontrar URLs dos Produtos

Visita os sites dos supermercados e copia os URLs dos produtos:

- **Continente**: https://www.continente.pt
- **Lidl**: https://www.lidl.pt
- **Auchan**: https://www.auchan.pt

Edita `config.js` e substitui os URLs de exemplo pelos URLs reais.

### 2. Encontrar Seletores CSS

Os seletores CSS identificam onde está o preço na página.

**Como encontrar:**

1. Abre a página do produto no browser
2. Clica com botão direito no preço → "Inspecionar"
3. Procura classes CSS como `.price`, `.product-price`, etc.
4. Adiciona ao array de seletores em `config.js`

Exemplo:
```javascript
selectors: {
  continente: [
    '.ct-price-value',        // Seletor principal
    '[data-testid="price"]',  // Fallback 1
    '.product-price__value'   // Fallback 2
  ]
}
```

### 3. Testar

```bash
npm run scrape:real
```

O script vai:
- Abrir cada URL com Puppeteer
- Procurar o preço usando os seletores
- Guardar em `data/prices.json`
- Mostrar relatório de sucesso/falhas

## 🔍 Troubleshooting

### "Preço não encontrado"

- Os seletores CSS estão desatualizados
- O site mudou o layout
- Precisa aguardar mais tempo para JavaScript carregar

**Solução:** Inspeciona a página e atualiza os seletores em `config.js`

### "Timeout" ou "Navigation failed"

- URL incorreto
- Site bloqueia bots
- Conexão lenta

**Solução:**
- Verifica o URL
- Aumenta o timeout em `scraper.js`
- Adiciona mais delays

### Site bloqueia o scraper

Alguns sites têm proteções anti-bot.

**Soluções:**
- Adiciona delays entre requests
- Usa proxies rotativos
- Considera APIs oficiais (se existirem)
- Respeita robots.txt e termos de serviço

## ⚠️ Notas Importantes

### Legalidade

- Web scraping pode violar termos de serviço
- Verifica sempre o `robots.txt` dos sites
- Usa com responsabilidade e ética
- Para uso pessoal/educacional

### Performance

- Scraping é lento (30-60s para todos os produtos)
- Não faças scraping em excesso
- Considera adicionar cache/delays

### Alternativas

Se o scraping for problemático, considera:

1. **APIs Oficiais**: Alguns supermercados têm APIs
2. **Inserção Manual**: Atualiza `prices.json` manualmente
3. **Crowdsourcing**: Deixa utilizadores reportarem preços
4. **Parceria**: Contacta supermercados para dados

## 📊 Fluxo de Trabalho Recomendado

```bash
# 1. Testa com dados simulados
npm run scrape

# 2. Verifica que a app funciona
npm run dev
# Abre http://localhost:3000

# 3. Configura URLs reais gradualmente
# Edita config.js - começa com 1-2 produtos

# 4. Testa scraping real
npm run scrape:real

# 5. Expande para todos os produtos
# Adiciona mais URLs ao config.js

# 6. Automatiza (opcional)
# Cria cron job ou GitHub Action para atualizar diariamente
```

## 🛠️ Personalização

### Adicionar Novos Produtos

Em `config.js`:

```javascript
products: {
  batatas: {
    continente: 'URL_AQUI',
    lidl: 'URL_AQUI',
    auchan: 'URL_AQUI'
  }
}
```

### Adicionar Novo Supermercado

1. Adiciona ao `products` em cada produto
2. Adiciona seletores em `selectors`
3. O scraper deteta automaticamente!

### Mudar Frequência

Cria um cron job (Linux/Mac):

```bash
# Atualizar preços diariamente às 2h da manhã
0 2 * * * cd ~/Projects/comparador-precos && npm run scrape
```

## 💡 Dicas

1. **Começa pequeno**: Testa com 1-2 produtos primeiro
2. **Usa demo**: O scraper simulado é ótimo para desenvolvimento
3. **Logs**: Observa os logs para debugging
4. **Backup**: Faz backup de `prices.json` antes de testar
5. **Rate limiting**: Adiciona delays para não sobrecarregar sites

## 📚 Recursos

- [Puppeteer Docs](https://pptr.dev/)
- [CSS Selectors Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors)
- [Web Scraping Best Practices](https://www.scrapingbee.com/blog/web-scraping-best-practices/)

---

**Questões?** Verifica os logs ou ajusta configurações em `config.js`!
