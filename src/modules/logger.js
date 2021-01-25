const chalk = require('chalk')
const debugFuncGen = require('debug')

const options = {
  debugMode: false,
  forceEnableLogsOnDebug: false
}

const func = (scope) => {
  const debugFunc = debugFuncGen('flashbot:' + scope)

  const useNormalLog = !options.debugMode || options.forceEnableLogaOnDebug || false

  return {
    log: (msg) => {
      if (useNormalLog) log(scope, msg)
      debugFunc(chalk.cyanBright(msg))
    },
    debug: (msg) => {
      if (options.debugMode) {
        if (useNormalLog) debug(scope, msg)
        debugFunc(chalk.blueBright(msg))
      }
    },
    warn: (msg) => {
      if (useNormalLog) warn(scope, msg)
      debugFunc(chalk.yellow(msg))
    },
    error: (msg) => {
      if (useNormalLog) error(scope, msg)
      debugFunc(chalk.redBright(msg))
    },
    fatal: (msg) => {
      if (useNormalLog) fatal(scope, msg)
      debugFunc(chalk.red(msg))

      process.exit(1)
    },

    extend: (str) => func(`${scope}:${str}`)
  }
}

func.options = options

func.init = (debugMode, opts) => {
  console.log('Logger Init...')

  console.log('== Logger Options ==')

  options.debugMode = Boolean(debugMode)
  console.log(`options.debugMode = ${String(options.debugMode)}`)
  options.forceEnableLogsOnDebug = Boolean(opts.forceEnableLogsOnDebug)
  console.log(`options.forceEnableLogsOnDebug = ${String(options.forceEnableLogsOnDebug)}`)

  if (options.debugMode) debugFuncGen.enable('flashbot*')
}

func.logChat = (msg) => {
  console.log(`${_genDatetime()} ${msg}`)
}

function log (from, msg) {
  console.log(_genDatetime() + chalk.cyanBright(' [Log | ' + from + '] ' + msg))
}

function debug (from, msg) {
  if (this.debugMode) console.log(_genDatetime() + chalk.blueBright(' [Debug | ' + from + '] ' + msg))
}

function warn (from, msg) {
  console.warn(_genDatetime() + chalk.yellow(' [WARN | ' + from + '] ' + msg))
}

function error (from, msg) {
  console.error(_genDatetime() + chalk.redBright(' [ERROR | ' + from + '] ' + msg))
}

function fatal (from, msg) {
  console.error(_genDatetime() + chalk.red(' [FATAL | ' + from + '] FATAL ERROR: ' + msg))
}

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

module.exports = func
