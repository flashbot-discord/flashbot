class Extension {
  constructor(client, infos) {
    this._client = client

    this._name = infos.name || ''
    this._desc = infos.description || ''

    if(this._name.length < 1) return client.logger.error('Extension', 'Extension name is empty.')
    this._config = client.config.extensions[this._name] || {}

    const logTxt = 'Extension / ' + this._name
    this._logger = {
      log: (msg) => client.logger.log(logTxt, msg),
      debug: (msg) => client.logger.debug(logTxt, msg),
      warn: (msg) => client.logger.warn(logTxt, msg),
      error: (msg) => client.logger.error(logTxt, msg),
      fatal: (msg) => client.logger.fatal(logTxt, msg)
    }
  }
}

module.exports = Extension
