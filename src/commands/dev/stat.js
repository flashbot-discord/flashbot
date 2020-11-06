const Command = require('../../structures/Command')

class StatCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'stat',
      aliases: ['stats', 'statistics', '통계'],
      description: 'commands.stat.DESC',
      group: 'dev',
      owner: true
    })
  }

  run (client, msg, query, locale) {
    const t = client.locale.t

    const total = client.commands.stats.getTotal()
    msg.channel.send(t('commands.stat.total', locale, total))
  }
}

module.exports = StatCommand
