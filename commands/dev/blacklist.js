const moment = require('moment-timezone')

const Command = require('../../classes/Command')
const parsePeriod = require('../../modules/parsePeriod')
const database = require('../../database')

class BlacklistCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'blacklist',
      aliases: ['블랙리스트', '블랙', 'ㅠㅣㅁ차ㅣㅑㄴㅅ', 'qmfforfltmxm', 'qmffor'],
      description: 'commands.blacklist.DESC:Blacklist',
      group: 'dev',
      owner: true
    })
  }

  async run (client, msg, query, locale) {
    const t = client.locale.t

    const cmd = query.args[0]
    switch (cmd) {
      case '추가':
      case 'add':
      case 'cnrk':
      case 'ㅁㅇㅇ': {
        // NOTE: Usage: //blacklist add <userid|@mention> <period> [reason]
        const targetUserId = msg.mentions.users.size > 0
          ? msg.mentions.users.first().id
          : query.args[1]
        const period = query.args[2]
        const reason = query.args[3] ? query.args[3] : null

        // If it's invalid form, show the usage
        if (!targetUserId || !period) return msg.reply(
          '```\n' +
          `${t('commands.blacklist.add.usage', locale, query.prefix)}\n\n` +
          `${t('modules.parsePeriod', locale)}\n` +
          '```'
        )

        // Reject if already added
        if (database.blacklist.get(client.db, targetUserId)) return msg.reply(t('commands.blacklist.error.alreadyExists', locale))

        // Parse period
        const parsedPeriod = parsePeriod(period)
        if (parsedPeriod == null) return msg.reply(t('commands.blacklist.error.invalidPeriod', locale))

        // Calculate the end time
        const endDate = moment()
          .add(parsedPeriod)
          .tz('Asia/Seoul')

        // Add to blacklist
        const success = database.blacklist.add(client.db, {
          id: targetUserId,
          endDate: endDate.toDate(),
          reason
        })

        if (success) msg.reply(t('commands.blacklist.add.complete', locale, endDate.format('YYYY/M/D HH:mm:ss (Z)')))
        else throw new Error('Unexpected blacklist add failure')
        break
      }

      default:
        msg.reply(
          '```\n' + 
          `${t('commands.blacklist.usage', locale, query.prefix)}\n\n` +
          '```'
        )
    }
  }
}

module.exports = BlacklistCommand
