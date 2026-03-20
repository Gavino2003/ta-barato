// Configuração do browser para funcionar em Vercel (serverless) e local

async function getBrowserConfig() {
  const isProduction = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME

  if (isProduction) {
    // Ambiente serverless (Vercel, AWS Lambda, etc)
    const chromium = require('@sparticuz/chromium')
    const puppeteerCore = require('puppeteer-core')

    return {
      puppeteer: puppeteerCore,
      launchOptions: {
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      }
    }
  } else {
    // Ambiente local (desenvolvimento)
    const puppeteer = require('puppeteer')

    return {
      puppeteer: puppeteer,
      launchOptions: {
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    }
  }
}

module.exports = { getBrowserConfig }
