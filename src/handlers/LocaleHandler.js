const path = require('path')
const { I18n } = require('i18n')

const database = require('../database')

const loggerGen = require('../shared/logger')
const logger = loggerGen('LocaleHandler')
const loggeri18n = loggerGen('i18n')

class LocaleHandler {
  constructor (client) {
    logger.log('setting up i18n')
    const i18n = new I18n()
    i18n.configure({
      directory: path.join(path.resolve(), 'src', 'locale'),
      defaultLocale: 'ko_KR',
      objectNotation: true,
      syncFiles: true,
      autoReload: true,
      indent: '  ',
      logDebugFn: (msg) => loggeri18n.debug(msg),
      logWarnFn: (msg) => loggeri18n.warn(msg),
      logErrorFn: (msg) => loggeri18n.error(msg)
    })
    this.i18n = i18n
    this.defaultLocale = 'ko_KR'

    this._client = client
    logger.log('i18n has been set up')
  }

  getTranslateFunc (baseLocale) {
    const t = (phraseOrOptions, ...args) => {
      let phrase
      let locale = baseLocale
      if (typeof phraseOrOptions === 'object') {
        phrase = phraseOrOptions.phrase
        if (phraseOrOptions.locale) locale = phraseOrOptions.locale
      } else phrase = phraseOrOptions

      return this.i18n.__({ phrase, locale }, ...args)
    }

    const tn = (phraseOrOptions, count) => {
      let phrase
      let locale = baseLocale
      if (typeof phraseOrOptions === 'object') {
        phrase = phraseOrOptions.phrase
        if (phraseOrOptions.locale) locale = phraseOrOptions.locale
      } else phrase = phraseOrOptions

      return this.i18n.__n({
        singular: phrase,
        plural: phrase,
        locale,
        count
      })
    }

    return { t, tn }
  }

  async getLocale (isGuild, obj) {
    const logPos = this.logPos + '.getLocale'
    let locale

    try {
      locale = await database.locale.get(this._client.db, obj.id, isGuild)
    } catch (err) {
      this._client.logger.warn(logPos,
        `Cannot load ${isGuild ? 'guild' : 'user'} locale information of ${isGuild ? obj.name : obj.tag} (${obj.id}). Falling back to default locale '${this.defaultLocale}': ${err.stack}`)
      return null
    }

    if (locale == null) return this.defaultLocale // Default: ko_KR
    else return locale
  }
}

module.exports = LocaleHandler
