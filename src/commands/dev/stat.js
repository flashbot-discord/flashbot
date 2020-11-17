const Command = require('../_Command')

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

  run (client, msg, query, { t }) {
    const total = client.commands.stats.getTotal()
    msg.channel.send(t('commands.stat.total', total))
  }
}

module.exports = StatCommand
