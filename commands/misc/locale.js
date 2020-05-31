/**
 * @name locale.js
 * @description 설정된 언어 확인 및 변경
 */

const Command = require('../../classes/Command')

class LocaleCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'locale',
      aliases: ['언어', 'ㅣㅐㅊ믿', 'djsdj'],
      description: 'commands.locale.DESC:See or change the bot locale on the server.',
      group: 'misc',
      guildOnly: true,
      requireDB: true,
      args: [
        {
          name: 'commands.locale.args.locale.NAME:locale',
          description: 'commands.locale.args.locale.DESC: When present, change the locale of the server to this value.',
          type: 'common.string:string',
          optional: true
        }
      ]
    })
  }

  async run (client, msg, query, locale) {
    if (!await client.db.isRegisteredGuild(msg.guild.id)) return Command.pleaseRegisterGuild(this, msg, locale)

    if (query.args.length < 1) {
      return await msg.channel.send(client.locale.t('commands.locale.get:The current language is: `%1$s`', locale, locale))
    } else {
      if (!client.config.owner.includes(msg.author.id) && !msg.member.permissions.has('ADMINISTRATOR')) return await msg.channel.send(client.locale.t("commands.locale.noPermission:You don't have `ADMINISTRATOR` permission to do that.", locale))
      else {
        const language = query.args[0]
        if (!client.locale.i18n.getLocales().includes(language)) return await msg.channel.send(client.locale.t('commands.locale.noLanguage:The language you entered does not exist.', locale))
        await this.dbHandle(msg.guild, language)
        await msg.channel.send(client.locale.t('commands.locale.set:Language setting changed to `%1$s`.', locale, language))
      }
    }
  }

  async dbHandle (guild, locale) {
    switch (this._client.db.type) {
      case 'mysql':
      case 'pg':
        await this._client.db.knex('guilds').update({ locale }).where('id', guild.id)
        break

      case 'json':
        this._client.db.obj.guild[guild.id].locale = locale
        break
    }
  }
}

module.exports = LocaleCommand
