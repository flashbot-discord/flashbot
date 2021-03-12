const Command = require('../_Command')

class PingCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'ping',
      aliases: ['핑'],
      group: 'info'
    })
  }

  async run (client, msg, _query, { t }) {
    const m = await msg.channel.send(t('commands.ping.pinging'))

    const wsPing = t('commands.ping.websocketPing', Math.round(client.ws.ping))
    const msgPing = t('commands.ping.msgPing', Math.round(m.createdTimestamp - msg.createdTimestamp))
    return m.edit(wsPing + '\n' + msgPing)
  }
}

module.exports = PingCommand
