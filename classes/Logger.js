const chalk = require('chalk')

class Logger {
  constructor (debug) {
    this.debugMode = debug
  }

  onCmd (msg) {
    console.log(`${this._genDatetime()} ${msg}`)
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
      String(date.getMonth() + 1).padStart(2, '0') + '-' +
      String(date.getDate()).padStart(2, '0') + ' ' +
      String(date.getHours()).padStart(2, '0') + ':' +
      String(date.getMinutes()).padStart(2, '0') + ':' +
      String(date.getSeconds()).padStart(2, '0') + '.' +
      String(date.getMilliseconds()).padStart(3, '0') + ']'
  }
}

module.exports = Logger
