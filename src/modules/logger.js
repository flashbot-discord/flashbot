const chalk = require('chalk')
const stripColor = require('strip-ansi')

const { createLogger, format, transports, addColors } = require('winston')
const { printf, splat, colorize, timestamp, ms, combine } = format

const config = require('../../config')

const colors = {
  fatal: chalk.bgWhite.red.bold,
  error: chalk.red,
  warn: chalk.yellow,
  info: chalk.cyanBright,
  chat: text => text,
  verbose: chalk.blueBright,
  debug: chalk.blue
}

const myFormat = printf(({
  level,
  message,
  label,
  timestamp,
  ms
}) => {
  const colorizer = colors[stripColor(level)]
  return `${colorizer(`[${timestamp}] [${label}]`)} ${level} | ${colorizer(message)} ${chalk.magentaBright(ms)}`
})

const myCustomLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    chat: 4,
    verbose: 5,
    debug: 6
  },
  colors: {
    fatal: 'whiteBG red bold',
    error: 'red',
    warn: 'yellow',
    info: 'white',
    chat: 'grey',
    verbose: 'cyan',
    debug: 'blue'
  }
}

const logger = createLogger({
  levels: myCustomLevels.levels,
  transports: [
    new transports.Console({
      level: config.debug ? 'debug' : 'chat',
      format: combine(
        splat(),
        colorize(),
        timestamp(),
        ms(),
        myFormat
      )
    })
  ]
})

addColors(myCustomLevels.colors)

const func = (scope) => {
  return {
    chat: (msg) => {
      logger.chat(msg, { label: 'chat' })
    },
    log: (msg, ...args) => {
      logger.info(msg, ...args, { label: scope })
    },
    debug: (msg, ...args) => {
      logger.debug(msg, ...args, { label: scope })
    },
    verbose: (msg, ...args) => {
      logger.verbose(msg, ...args, { label: scope })
    },
    warn: (msg, ...args) => {
      logger.warn(msg, ...args, { label: scope })
    },
    error: (msg, ...args) => {
      logger.error(msg, ...args, { label: scope })
    },
    fatal: (msg, ...args) => {
      logger.fatal(msg, ...args, { label: scope })

      process.exit(1)
    },

    extend: (str) => func(`${scope}:${str}`)
  }
}

/*
func.init = (debugMode, opts) => {
  console.log('Logger Init...')

  console.log('== Logger Options ==')

  options.debugMode = Boolean(debugMode)
  console.log(`options.debugMode = ${String(options.debugMode)}`)
  options.forceEnableLogsOnDebug = Boolean(opts.forceEnableLogsOnDebug)
  console.log(`options.forceEnableLogsOnDebug = ${String(options.forceEnableLogsOnDebug)}`)

  if (options.debugMode) debugFuncGen.enable('flashbot*')
}
*/

/*
function _genDatetime () {
  const date = new Date()
  return '[' + date.getFullYear() + '-' +
      String(date.getMonth() + 1).padStart(2, '0') + '-' +
      String(date.getDate()).padStart(2, '0') + ' ' +
      String(date.getHours()).padStart(2, '0') + ':' +
      String(date.getMinutes()).padStart(2, '0') + ':' +
      String(date.getSeconds()).padStart(2, '0') + '.' +
      String(date.getMilliseconds()).padStart(3, '0') + ']'
}
*/

module.exports = func
