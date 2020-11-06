/**
 * @name locale.js
 * @description 설정된 언어 확인 및 변경
 */

const Command = require('../../structures/Command')
const database = require('../../database')

class LocaleCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'locale',
      aliases: [
        'language', 'lang', '언어',
        'ㅣㅐㅊ믿', 'ㅣ무혐ㅎㄷ', 'ㅣ뭏', 'djsdj'
      ],
      description: 'commands.locale.DESC:See or change the bot locale on the server.',
      group: 'settings',
      requireDB: true,
      userReg: true,
      args: [
        {
          name: 'commands.locale.args.locale.NAME:locale',
          description: 'commands.locale.args.locale.DESC: When present, change the locale of the server to this value.',
          type: 'common.string',
          optional: true
        }
      ]
    })
  }

  async run (client, msg, query, locale) {
    const t = client.locale.t
    const editPerms = ['ADMINISTRATOR']

    if (query.args.length < 1) {
      const guildLocale = await client.locale.getLocale(true, msg.guild)
      return msg.channel.send(t('commands.locale.get', locale, locale, guildLocale))
    }

    const subcommand = query.args[0]
    switch (subcommand) {
      case 'list':
        return msg.channel.send(t('commands.locale.list', locale, client.locale.i18n.getLocales().join('`\n`')))

      case 'set': {
        const language = query.args[1]
        if (!client.locale.i18n.getLocales().includes(language)) return msg.channel.send(t('commands.locale.noLanguage', locale))

        let id = msg.author.id
        let guildMode = false
        if (['--guild', '-g'].includes(query.args[2])) {
          if (!client.config.owner.includes(msg.author.id) && !msg.member.permissions.any(editPerms)) {
            const translatedPerms = []
            editPerms.forEach((p) => translatedPerms.push(t('perms.' + p, locale)))
            return msg.channel.send(t('commands.locale.noPermission', locale, translatedPerms.join('`, `')))
          }

          guildMode = true
          id = msg.guild.id
        }

        await database.locale.set(this._client.db, id, guildMode, language)
        msg.channel.send(t(guildMode ? 'commands.locale.set.guild' : 'commands.locale.set.user', language, language))
      }
    }
  }
}

module.exports = LocaleCommand
