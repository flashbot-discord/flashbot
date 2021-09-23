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
      group: 'settings',
      requireDB: true,
      userReg: true
    })
  }

  * args () {
    const returnObj = {}

    const { mode } = yield {
      arg: {
        key: 'mode',
        type: 'string',
        optional: true
      }
    }

    switch (mode) {
      case 'list':
      case '목록':
        returnObj.mode = 'list'
        break

      case 'set':
      case '설정': {
        returnObj.mode = 'set'
        const { locale, guild } = yield {
          flags: {
            guild: {
              type: 'boolean',
              aliases: ['g']
            }
          },
          arg: {
            key: 'locale',
            type: 'string'
          }
        }
        returnObj.locale = locale
        returnObj.guild = guild

        break
      }

      default:
        returnObj.mode = null
    }

    return returnObj
  }

  async run (client, msg, query, { t }) {
    const editPerms = ['MANAGE_GUILD']

    if (!query.args.mode) {
      const userLocale = await client.locale.getLocale(false, msg.author)
      const guildLocale = await client.locale.getLocale(true, msg.guild)
      await msg.reply(t('commands.locale.get', userLocale, guildLocale))
    }

    const subcommand = query.args.mode
    switch (subcommand) {
      case 'list': {
        const listText = client.locale.i18n.getLocales()
          .reduce((acc, localeCode) => `${acc}\n- \`${localeCode}\``, '')
        await msg.reply(`${t('commands.locale.list')}${listText}`)
        break
      }

      case 'set': {
        const language = query.args.locale
        if (!client.locale.i18n.getLocales().includes(language)) {
          return await msg.reply(t('commands.locale.noLanguage'))
        }

        let id = msg.author.id
        let guildMode = false
        if (query.args.guild) {
          if (!client.config.owner.includes(msg.author.id) && !msg.member.permissions.any(editPerms)) {
            const translatedPerms = []
            editPerms.forEach((p) => translatedPerms.push(t('perms.' + p)))
            return await msg.reply(t('commands.locale.noPermission', translatedPerms.join('`, `')))
          }

          // FIXME: guild registration check (manually)

          guildMode = true
          id = msg.guild.id
        }

        await database.locale.set(this._client.db, id, guildMode, language)
        await msg.reply(t({
          phrase: guildMode ? 'commands.locale.set.guild' : 'commands.locale.set.user',
          locale: language
        }, language))

        break
      }
    }
  }
}

module.exports = LocaleCommand
