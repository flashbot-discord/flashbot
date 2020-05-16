class Extension {
  constructor (client, infos) {
    this._logPos = 'Extension'
    this._client = client

    this._name = infos.name || ''
    this._desc = infos.description || ''

    if (this._name.length < 1) return client.logger.error(this._logPos, 'Extension name is empty.')
    this._config = client.config.extensions[this._name] || {}

    const logTxt = this._logPos + ' / ' + this._name
    this._logger = {
      log: (msg) => client.logger.log(logTxt, msg),
      debug: (msg) => client.logger.debug(logTxt, msg),
      warn: (msg) => client.logger.warn(logTxt, msg),
      error: (msg) => client.logger.error(logTxt, msg),
      fatal: (msg) => client.logger.fatal(logTxt, msg)
    }
  }

  init() {
    throw new Error('init() method not implemented')
  }

  destroy() {
    throw new Error('destroy() method not implemented')
  }
}

module.exports = Extension
