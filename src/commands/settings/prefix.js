const Command = require('../_Command')
const textFormat = require('../../modules/textFormat')
const database = require('../../database')
const getPrefix = require('../../modules/getPrefix')

class PrefixCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'prefix',
      aliases: ['접두사', '접두어', 'ㅔㄱㄷ럍', 'wjqentk', 'wjqendj'],
      description: 'commands.prefix.DESC',
      group: 'settings',
      requireDB: true,
      guildOnly: true,
      guildAct: true
    })
  }

  async run (client, msg, query, { t }) {
    // Get mode
    if (query.args.length < 1) {
      const prefix = await getPrefix(client, msg.guild.id)
      return msg.channel.send(t('commands.prefix.info', prefix))
    } else if (['set', '설정'].includes(query.args[0])) {
    // Set mode
      const setPerms = ['MANAGE_GUILD']

      if (query.args.length < 2) {
        const prefix = await database.guilds.prefix.get((this._client.db, msg.guild.id))
        return msg.reply(t('commands.prefix.set.pleaseEnterPrefix', prefix))
      } else if (!client.config.owner.includes(msg.author.id) && !msg.member.permissions.any(setPerms)) return msg.reply(t('commands.prefix.set.noPerms'))
      else {
        const prefix = query.args[1]

        if (prefix.length > 11) return msg.reply(t('commands.prefix.set.tooLong'))
        if (textFormat.hasEveryoneMention(prefix)) return msg.reply(t('commands.prefix.set.everyoneNotAllowed'))

        await database.guilds.prefix.set(this._client.db, msg.guild.id, prefix)
        return msg.channel.send(t('commands.prefix.set.complete', prefix))
      }
    }
  }
}

module.exports = PrefixCommand
