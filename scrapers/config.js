// Configuração dos produtos a fazer scraping
// NOTA: URLs são exemplos - precisam ser atualizados com URLs reais dos produtos

module.exports = {
  products: {
    leite: {
      continente: 'https://www.continente.pt/produto/leite-meio-gordo-mimosa-1-l',
      lidl: 'https://www.lidl.pt/p/laticínios-e-ovos/leite-meio-gordo',
      auchan: 'https://www.auchan.pt/pt/lacticinios-ovos-e-sobremesas/leite/leite-meio-gordo'
    },
    arroz: {
      continente: 'https://www.continente.pt/produto/arroz-agulha-continente-1-kg',
      lidl: 'https://www.lidl.pt/p/mercearia/arroz-agulha-1kg',
      auchan: 'https://www.auchan.pt/pt/mercearia-salgada/arroz-massa-e-farinhas/arroz'
    },
    ovos: {
      continente: 'https://www.continente.pt/produto/ovos-frescos-m-continente-6-un',
      lidl: 'https://www.lidl.pt/p/laticínios-e-ovos/ovos-frescos-6-unidades',
      auchan: 'https://www.auchan.pt/pt/lacticinios-ovos-e-sobremesas/ovos'
    },
    azeite: {
      continente: 'https://www.continente.pt/produto/azeite-virgem-extra-continente-750-ml',
      lidl: 'https://www.lidl.pt/p/mercearia/azeite-virgem-extra',
      auchan: 'https://www.auchan.pt/pt/mercearia-salgada/azeites-e-vinagres/azeite'
    },
    massa: {
      continente: 'https://www.continente.pt/produto/massa-esparguete-continente-500-g',
      lidl: 'https://www.lidl.pt/p/mercearia/massa-esparguete-500g',
      auchan: 'https://www.auchan.pt/pt/mercearia-salgada/arroz-massa-e-farinhas/massa'
    },
    agua: {
      continente: 'https://www.continente.pt/produto/agua-natural-continente-1-5-l',
      lidl: 'https://www.lidl.pt/p/bebidas/agua-natural-1-5l',
      auchan: 'https://www.auchan.pt/pt/bebidas/agua/agua-natural'
    },
    cafe: {
      continente: 'https://www.continente.pt/produto/cafe-delta-250-g',
      lidl: 'https://www.lidl.pt/p/mercearia/cafe-moído-250g',
      auchan: 'https://www.auchan.pt/pt/mercearia-salgada/cafe-cha-e-substitutos/cafe'
    },
    acucar: {
      continente: 'https://www.continente.pt/produto/acucar-branco-continente-1-kg',
      lidl: 'https://www.lidl.pt/p/mercearia/acucar-branco-1kg',
      auchan: 'https://www.auchan.pt/pt/mercearia-salgada/acucar-e-adocantes/acucar'
    },
    farinha: {
      continente: 'https://www.continente.pt/produto/farinha-tipo-65-continente-1-kg',
      lidl: 'https://www.lidl.pt/p/mercearia/farinha-tipo-65-1kg',
      auchan: 'https://www.auchan.pt/pt/mercearia-salgada/arroz-massa-e-farinhas/farinha'
    },
    manteiga: {
      continente: 'https://www.continente.pt/produto/manteiga-com-sal-continente-250-g',
      lidl: 'https://www.lidl.pt/p/laticínios-e-ovos/manteiga-com-sal-250g',
      auchan: 'https://www.auchan.pt/pt/lacticinios-ovos-e-sobremesas/manteiga-e-margarinas/manteiga'
    }
  },

  // Seletores CSS para extrair preços (podem precisar de ajustes)
  selectors: {
    continente: [
      '.ct-price-value',
      '[data-testid="price"]',
      '.pwc-tile--price',
      '.product-price__value'
    ],
    lidl: [
      '.price',
      '.m-price__price',
      '[data-qa="price"]',
      '.product-price'
    ],
    auchan: [
      '.product-price',
      '.price-tag',
      '[data-price]',
      '.final-price'
    ]
  }
}
