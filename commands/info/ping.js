const Command = require('../../classes/Command')

class PingCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'ping',
      description: 'commands.ping.DESC:Pong!',
      aliases: ['핑'],
      group: 'info'
    })
  }

  async run (client, msg, _query, locale) {
    const t = client.locale.t
    const m = await msg.channel.send(t('commands.ping.pinging', locale))

    const wsPing = t('commands.ping.websocketPing', locale, Math.round(client.ws.ping))
    const msgPing = t('commands.ping.msgPing', locale, Math.round(m.createdTimestamp - msg.createdTimestamp))
    return m.edit(wsPing + '\n' + msgPing)
  }
}

module.exports = PingCommand
