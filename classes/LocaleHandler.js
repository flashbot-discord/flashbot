const i18n = require('i18n')

class LocaleHandler {
  constructor(client) {
    client.logger.log('LocaleHandler', 'Setting up i18n')
    i18n.configure({                                             directory: './locale',
      objectNotation: true,
      syncFiles: true,
      autoReload: true,
      logDebugFn: (msg) => client.logger.debug('i18n', msg),
      logWarnFn: (msg) => client.logger.warn('i18n', msg),
      logErrorFn: (msg) => client.logger.error('i18n', msg)
    })

    this.i18n = i18n
    this.t = (phrase, locale, ...args) => i18n.__({phrase, locale }, ...args)

    this._client = client
    client.logger.log('LocaleHandler', 'i18n has been set up')
  }

  async getGuildLocale(id) {
    // TODO Database
    return 'en_US'
  }
}

module.exports = LocaleHandler
