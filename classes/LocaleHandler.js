const i18n = require('i18n')

class LocaleHandler {
  constructor (client) {
    const logPos = this.logPos = 'LocaleHandler'

    client.logger.log(logPos, 'Setting up i18n')
    i18n.configure({
      directory: './locale',
      defaultLocale: 'ko_KR',
      objectNotation: true,
      syncFiles: true,
      autoReload: true,
      indent: '  ',
      logDebugFn: (msg) => client.logger.debug('i18n', msg),
      logWarnFn: (msg) => client.logger.warn('i18n', msg),
      logErrorFn: (msg) => client.logger.error('i18n', msg)
    })
    this.i18n = i18n

    this._client = client
    client.logger.log(logPos, 'i18n has been set up')
  }

  t (phrase, locale, ...args) {
    return i18n.__({ phrase, locale }, ...args)
  }

  async getLocale (isGuild, obj) {
    const logPos = this.logPos + '.getLocale'

    switch (this._client.db.type) {
      case 'mysql':
      case 'pg': {
        let d
        const type = isGuild ? 'guilds' : 'users'
        try {
          d = await this._client.db.knex(type).select('locale').where('id', obj.id)
        } catch (err) {
          this._client.logger.warn(logPos,
            `Cannot load ${isGuild ? 'guild' : 'user'} locale information of ${isGuild ? obj.name : obj.tag} (${obj.id}). Falling back to default locale '${this._client.config.defaultLocale}': ${err.stack}`)
          return this._client.config.defaultLocale
        }

        if (d.length < 1) return this._client.config.defaultLocale // Default
        else return d[0].locale
      }

      case 'json': {
        const db = this._client.db.obj
        const type = isGuild ? 'guild' : 'user'
        if (!db[type][obj.id]) return this._client.config.defaultLocale
        const l = db[type][obj.id].locale
        if (!l) return this._client.config.defaultLocale
        else return l
      }
    }
  }
}

module.exports = LocaleHandler
