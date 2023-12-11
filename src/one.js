import playwright from 'playwright'

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import path from 'node:path'

const argv =
  yargs(hideBin(process.argv))
    .command('transform', 'Transform PNG to SVG', {
      filePath: {
        description: 'Path to a file to parse',
        type: 'string',
        require: true
      },

      outputDir: {
        description: 'Path to a directory where output files will be placed',
        type: 'string',
        require: true
      },

      newFileName: {
        description: 'New file name. If omitted, fileToParse name will be used',
        type: 'string'
      }
    })
    .help()
    .argv

async function start() {
  const browser = await playwright.chromium.launch()
  const context = await browser.newContext()

  const page = await context.newPage()

  page.setDefaultTimeout(0)

  const state = {
    httpResponseCodes: []
  }

  page.on('response', async response => {
    state.httpResponseCodes.push(response.status())
  })

  await page.goto('https://vectorizer.ai')

  const fileChooserPromise = page.waitForEvent('filechooser')

  await page.getByText('DRAG IMAGE HERE TO BEGIN').click()

  const fileChooser = await fileChooserPromise

  await fileChooser.setFiles(argv.filePath)

  const $cropButton = '.PreCrop-Sidebar-crop_button'
  const $rightCanvas = '#App-ImageView-RightCanvas'
  const $cropButtonClassName = 'PreCrop-Sidebar-crop_button bttn bttn_dark'
  const $downloadLink = '#App-DownloadLink'

  const result = await Promise.race([
    page.waitForSelector($cropButton),
    page.waitForSelector($rightCanvas),
  ])

  const a = await result.getProperty('className')
  const b = await a.jsonValue()

  if (b === $cropButtonClassName) {
    await page.locator($cropButton).click()

    await page.waitForSelector($rightCanvas)

    await page.locator($downloadLink).click()
  } else {
    await page.locator($downloadLink).click()
  }

  const downloadPromise = page.waitForEvent('download')

  await page.locator('.Options-footer button').click()

  const download = await downloadPromise

  await download.saveAs(path.join(argv.outputDir, argv.newFileName ?? download.suggestedFilename()))

  await browser.close({ reason: 'finished' })

  return state
}

const result = await start()

process.stdout.write(JSON.stringify(result))