const chalk = require('chalk')
const stripColor = require('strip-ansi')

const { createLogger, format, transports, addColors } = require('winston')
const { printf, splat, colorize, timestamp, ms, combine } = format

const debugGen = require('debug')
const debugChat = debugGen('flashbot:chat')

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

// NOTE: winston

const myFormat = printf(({
  level,
  message,
  label,
  timestamp,
  ms
}) => {
  const _level = stripColor(level)
  const colorizer = colors[_level]
  return `${chalk.grey(`[${timestamp}]`)} ${_level === 'chat' ? '' : `[${label}] `}${level} | ${colorizer(message)} ${chalk.magentaBright(ms)}`
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

// TODO: Not disable winston completely when using debug
// just disable console.logging and leave file output
const logger = createLogger({
  levels: myCustomLevels.levels,
  transports: [
    new transports.Console({
      level: config.logger && config.logger.level ? config.logger.level : 'chat',
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

// NOTE: debug

let useDebug = false
if (config.logger && config.logger.useDebug) {
  debugGen.enable('flashbot:*')
  useDebug = true
}

// NOTE: func to export
const func = (scope) => {
  const debug = debugGen(`flashbot:${scope}`)
  const debugFunc = (level, msg, ...args) => debug(`${colors[level](level)} ${msg}`, ...args)

  return {
    chat: (msg) => {
      if (!useDebug) logger.chat(msg, { label: 'chat' })
      debugChat(msg)
    },
    log: (msg, ...args) => {
      if (!useDebug) logger.info(msg, ...args, { label: scope })
      debugFunc('info', msg, ...args)
    },
    debug: (msg, ...args) => {
      if (!useDebug) logger.debug(msg, ...args, { label: scope })
      debugFunc('debug', msg, ...args)
    },
    verbose: (msg, ...args) => {
      if (!useDebug) logger.verbose(msg, ...args, { label: scope })
      debugFunc('verbose', msg, ...args)
    },
    warn: (msg, ...args) => {
      if (!useDebug) logger.warn(msg, ...args, { label: scope })
      debugFunc('warn', msg, ...args)
    },
    error: (msg, ...args) => {
      if (!useDebug) logger.error(msg, ...args, { label: scope })
      debugFunc('error', msg, ...args)
    },
    fatal: (msg, ...args) => {
      if (!useDebug) logger.fatal(msg, ...args, { label: scope })
      debugFunc('fatal', msg, ...args)

      process.exit(1)
    },

    extend: (str) => func(`${scope}.${str}`)
  }
}

module.exports = func
