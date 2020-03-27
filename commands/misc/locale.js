/**
 * @name lang.js
 * @description 설정된 언어 확인 및 변경
 */

const i18n = require('i18n')

const Command = require('../../classes/Command')

class LocaleCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'locale',
      aliases: ['언어'],
      description: '',
      guildOnly: true
    })
  }

  // independent permission checker (+ custom ertor message)
  hasPerm (msg) {
    if (msg.client.isOwner(msg.author.id)) return true
    else return msg.guild.member(msg.author).hasPermission('ADMINISTRATOR')
  }

  async run (msg, { language }) {
    if (!super.run(msg)) return

    if (language.length < 1) {
      return msg.say(i18n.__({
        phrase: 'commands.lang.execute.get',
        locale: await msg.client.getGuildLocale(msg.guild)
      }, await msg.client.getGuildLocale(msg.guild)))
    } else {
      if (!this.hasPerm(msg)) {
        return msg.say(await i18n.__ll('commands.lang.execute.noPermission', msg.guild))
      } else {
        // return msg.reply('access denied. (needs translation)');
        // i18n.setLocale(language);
        if (!i18n.getLocales().includes(language)) return msg.say(await i18n.__ll('commands.lang.execute.noLanguage', msg.guild))
        msg.client.provider.set('guilds', msg.guild.id, { lang: language })
        msg.say(i18n.__({
          phrase: 'commands.lang.execute.set',
          locale: await msg.client.getGuildLocale(msg.guild)
        }, language))
      }
    }
  }
}

module.exports = LocaleCommand
