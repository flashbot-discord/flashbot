const loggerGen = require('../shared/logger')
const logger = loggerGen('Extension')

class Extension {
  constructor (client, infos) {
    this._client = client

    this._name = infos.name || ''
    this._desc = infos.description || ''

    if (this._name.length < 1) return logger.error('Extension name is empty.')
    this._config = client.config.extensions[this._name] || {}

    const extLogger = loggerGen(`extension:${this._name}`)
    this._logger = {
      log: (msg) => extLogger.log(msg),
      verbose: (msg) => extLogger.verbose(msg),
      debug: (msg) => extLogger.debug(msg),
      warn: (msg) => extLogger.warn(msg),
      error: (msg) => extLogger.error(msg),
      fatal: (msg) => extLogger.fatal(msg)
    }
  }

  init () {
    throw new Error('init() method not implemented')
  }

  destroy () {
    throw new Error('destroy() method not implemented')
  }
}

module.exports = Extension
