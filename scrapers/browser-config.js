// Configuração do browser para funcionar em Vercel (serverless) e local
const fs = require('fs')

function getLocalChromePath() {
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium'
  ].filter(Boolean)

  return candidates.find((path) => fs.existsSync(path))
}

async function getBrowserConfig() {
  const isProduction = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
  const puppeteerCore = require('puppeteer-core')

  if (isProduction) {
    // Ambiente serverless (Vercel, AWS Lambda, etc)
    const chromium = require('@sparticuz/chromium')

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
    // Ambiente local (desenvolvimento) com Chrome instalado no sistema
    const chromePath = getLocalChromePath()
    if (!chromePath) {
      throw new Error('Chrome local nao encontrado. Define CHROME_PATH ou instala Google Chrome.')
    }

    return {
      puppeteer: puppeteerCore,
      launchOptions: {
        executablePath: chromePath,
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    }
  }
}

module.exports = { getBrowserConfig }
