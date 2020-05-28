const i18n = require('i18n')

class LocaleHandler {
  constructor (client) {
    const logPos = this.logPos = 'LocaleHandler'

    client.logger.log(logPos, 'Setting up i18n')
    i18n.configure({
      directory: './locale',
      defaultLocale: 'en_US',
      objectNotation: true,
      syncFiles: true,
      autoReload: true,
      indent: '  ',
      logDebugFn: (msg) => client.logger.debug('i18n', msg),
      logWarnFn: (msg) => client.logger.warn('i18n', msg),
      logErrorFn: (msg) => client.logger.error('i18n', msg)
    })

    this.i18n = i18n
    this.t = (phrase, locale, ...args) => i18n.__({ phrase, locale }, ...args)

    this._client = client
    client.logger.log(logPos, 'i18n has been set up')
  }

  async getGuildLocale (guild) {
    const logPos = this.logPos + '.getGuildLocale'

    switch (this._client.db.type) {
      case 'mysql':
      case 'pg': {
        let d
        try {
          d = await this._client.db.knex('guild').select('locale').where('id', guild.id)
        } catch (err) {
          this._client.logger.warn(logPos, 'Cannot load locale information of guild ' + guild.name + ' (' + guild.id + "). Falling back to default locale '" + this._client.config.defaultLocale + "': " + err.stack)
          return this._client.config.defaultLocale
        }

        if (d.length < 1) return 'en_US' // Default
        else return d[0].locale
      }

      case 'json': {
        const db = this._client.db.obj
        if (!db.guild[guild.id]) return this._client.config.defaultLocale
        const l = db.guild[guild.id].locale
        if (!l) return this._client.config.defaultLocale
        else return l
      }
    }
  }
}

module.exports = LocaleHandler
