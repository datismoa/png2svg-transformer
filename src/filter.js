import fs from 'node:fs/promises'
import path from 'node:path'

const getFileName = (fullPath) => {
  return path.basename(fullPath, path.extname(fullPath))
}

const INPUT_PATH = ''
const OUTPUT_PATH = ''

const inputFiles = new Set((await fs.readdir(INPUT_PATH)).map(getFileName))
const outputFiles = new Set((await fs.readdir(OUTPUT_PATH)).map(getFileName))

inputFiles.forEach(file => {
  if (!outputFiles.has(file)) return

  fs.rm(path.join(INPUT_PATH, `${file}.png`))
})