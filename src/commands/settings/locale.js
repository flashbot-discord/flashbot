/**
 * @name locale.js
 * @description 설정된 언어 확인 및 변경
 */

const Command = require('../_Command')
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
      args: {
        guild: {
          description: 'whether the locale shuold be set to guild. Only works on set mode.',
          aliases: ['g'],
          type: 'boolean'
        },
        _: [
          {
            key: 'mode',
            description: 'commands.locale.args.mode.DESC: When present, change the locale of the server to this value.',
            type: 'string',
            optional: true
          },
          {
            key: 'locale',
            description: 'commands.locale.args.locale.DESC:The locale to change. Only works in set mode.',
            type: 'string',
            optional: true
          }
        ]
      }
    })
  }

  async run (client, msg, query, { t }) {
    const editPerms = ['MANAGE_GUILD']

    if (!query.args.mode) {
      const guildLocale = await client.locale.getLocale(true, msg.guild)
      return msg.channel.send(t('commands.locale.get', guildLocale))
    }

    const subcommand = query.args.mode
    switch (subcommand) {
      case 'list':
        return msg.channel.send(t('commands.locale.list', client.locale.i18n.getLocales().join('`\n`')))

      case 'set': {
        const language = query.args.locale
        if (!client.locale.i18n.getLocales().includes(language)) return msg.channel.send(t('commands.locale.noLanguage'))

        let id = msg.author.id
        let guildMode = false
        if (query.args.guild) {
          if (!client.config.owner.includes(msg.author.id) && !msg.member.permissions.any(editPerms)) {
            const translatedPerms = []
            editPerms.forEach((p) => translatedPerms.push(t('perms.' + p)))
            return msg.channel.send(t('commands.locale.noPermission', translatedPerms.join('`, `')))
          }

          guildMode = true
          id = msg.guild.id
        }

        await database.locale.set(this._client.db, id, guildMode, language)
        msg.channel.send(t({
          phrase: guildMode ? 'commands.locale.set.guild' : 'commands.locale.set.user',
          locale: language
        }, language))
      }
    }
  }
}

module.exports = LocaleCommand
