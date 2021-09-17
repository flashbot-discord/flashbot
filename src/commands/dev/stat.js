const Command = require('../_Command')

class StatCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'stat',
      aliases: ['stats', 'statistics', '통계'],
      group: 'dev',
      owner: true
    })
  }

  async run (client, msg, query, { t }) {
    const total = client.commands.stats.getTotal()
    await msg.reply(t('commands.stat.total', total))
  }
}

module.exports = StatCommand
