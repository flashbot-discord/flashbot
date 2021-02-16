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
      userReg: true
    })
  }

  * args () {
    const returnObj = {}

    const { mode } = yield {
      unnamed: {
        key: 'mode',
        type: 'string',
        description: 'commands.locale.args.mode.DESC: When present, change the locale of the server to this value.',
        optional: true
      }
    }
    returnObj.mode = mode

    switch (mode) {
      case 'list':
        break

      case 'set': {
        const { locale, guild } = yield {
          named: {
            guild: {
              type: 'boolean',
              description: 'whether the locale shuold be set to guild.'
            }
          },
          unnamed: {
            key: 'locale',
            type: 'string',
            description: 'commands.locale.args.locale.DESC:The locale to change.'
          }
        }
        returnObj.locale = locale
        returnObj.guild = guild
      }
    }

    return returnObj
  }

  async run (client, msg, query, { t }) {
    const editPerms = ['MANAGE_GUILD']

    if (!query.args.mode) {
      const userLocale = await client.locale.getLocale(false, msg.author)
      const guildLocale = await client.locale.getLocale(true, msg.guild)
      return msg.channel.send(t('commands.locale.get', userLocale, guildLocale))
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
