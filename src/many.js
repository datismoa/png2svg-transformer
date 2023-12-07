import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import fs from 'node:fs'
import fsp from 'node:fs/promises'

import os from 'node:os'
import path from 'node:path'

import { execa } from 'execa'

import cliProgress from 'cli-progress'

import { Pool } from './Pool.js'
import { Timer } from './Timer.js'

const DEFAULTS = {
  INITIAL_THREADS_COUNT: 5,
  DELAY_AFTER_FAILED_REQUEST_MS: 5_000,
}

const argv =
  yargs(hideBin(process.argv))
    .command('run', 'Run transformation round', {
      inputDir: {
        description: 'Path to a directory with input files',
        type: 'string',
        require: true
      },

      outputDir: {
        description: 'Path to a directory where output files will be placed',
        type: 'string',
        require: true
      },

      initialThreads: {
        description: 'Initial transformation threads count',
        type: 'number',
        default: DEFAULTS.INITIAL_THREADS_COUNT
      },

      delayAfterFailedRequest: {
        description: 'Delay time in milliseconds, if a request is failed',
        type: 'number',
        default: DEFAULTS.DELAY_AFTER_FAILED_REQUEST_MS
      }
    })
    .help()
    .argv

const createWork = (fileName) => {
  const fn = async () => {
    const result = await execa('node', ['src/one.js', 'transform', '--filePath', path.join(argv.inputDir, fileName), '--outputDir', argv.outputDir])

    return result
  }

  return {
    id: fileName,
    fn
  }
}

const failedFileNames = []

const executor = async () => {
  console.log('--> STARTED')

  const files = await fsp.readdir(argv.inputDir)

  let offset = 0

  const WORKERS = argv.initialThreads

  const pool = new Pool(WORKERS)

  const timers = []
  let activeTimer = null

  const bar = new cliProgress.SingleBar({
    format: ' {bar} | {filename} | {value}/{total}',
    stopOnComplete: true
  }, cliProgress.Presets.shades_classic)

  bar.start(files.length, 0)

  const onTimerEnd = ({ delta }) => {
    const timer = timers.pop()

    if (!timer) {
      activeTimer = null

      tick()

      return
    }

    activeTimer = timer

    const { timerProcess, abortController } = timer.start()

    timerProcess.then(onTimerEnd)
  }

  const onWorkDone = (workId, result) => {
    offset += 1

    if (offset > files.length) {
      return
    }

    bar.update(offset, { filename: workId })

    const { httpResponseCodes } = JSON.parse(result.stdout)

    if (httpResponseCodes.includes(429)) {
      failedFileNames.push(workId)

      if (offset >= files.length && pool.availableWorkers === WORKERS) {
        process.exit()
      }

      const timer = new Timer({ duration: argv.delayAfterFailedRequest })

      if (!activeTimer) {
        activeTimer = timer

        const { timerProcess, abortController } = timer.start()

        timerProcess.then(onTimerEnd)
      }

      else {
        timers.push(timer)
      }

      return
    }

    if (activeTimer) {
      return
    }

    tick()
  }

  pool.onWorkDone = onWorkDone

  const tick = () => {
    if (offset >= files.length) {
      return
    }

    for (let i = 0; i < pool.availableWorkers; i++) {
      const workMeta = files[i + offset]

      if (workMeta === undefined) {
        break
      }

      pool.addWork(createWork(workMeta))
    }
  }

  tick()
}

const saveLog = () => {
  const logPath = path.join(os.homedir(), 'parsing-log.json')

  fs.writeFileSync(logPath, JSON.stringify(failedFileNames))

  return logPath
}

process.on('exit', () => {
  const logPath = saveLog()

  console.log(
    `\n`,
    `${failedFileNames.length} bad parsings.`,
    `Log: ${logPath}`
  )
})

process.on('SIGINT', () => {
  process.exit()
})

executor()