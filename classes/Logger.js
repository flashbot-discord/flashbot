const chalk = require('chalk')

class Logger {
  constructor (debug) {
    this.debugMode = debug
  }

  log (from, msg) {
    console.log(this._genDatetime() + chalk.green(' [Log / ' + from + '] ' + msg))
  }

  debug (from, msg) {
    if (this.debugMode) console.log(this._genDatetime() + chalk.blueBright(' [Debug / ' + from + '] ' + msg))
  }

  warn (from, msg) {
    console.warn(this._genDatetime() + chalk.yellow(' [WARN / ' + from + '] ' + msg))
  }

  error (from, msg) {
    console.error(this._genDatetime() + chalk.redBright(' [ERROR / ' + from + '] ' + msg))
  }

  fatal (from, msg) {
    console.error(this._genDatetime() + chalk.red(' [FATAL / ' + from + '] FATAL ERROR: ' + msg))
    process.exit(1)
  }

  _genDatetime () {
    const date = new Date()
    return '[' + date.getFullYear() + '-' +
      (date.getMonth() + 1) + '-' +
      date.getDate() + ' ' +
      date.getHours() + ':' +
      date.getMinutes() + ':' +
      date.getSeconds() + ']'
  }
}

module.exports = Logger
