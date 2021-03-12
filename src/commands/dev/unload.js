const Command = require('../_Command')

class UnloadCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'unload',
      aliases: ['ㅕㅟㅐㅁㅇ'],
      group: 'dev',
      owner: true,
      args: [
        {
          key: 'command',
          type: 'string'
        }
      ]
    })
  }

  async run (client, msg, query, { t }) {
    if (query.args.length < 1) {
      return msg.reply(Command.makeUsage(this, query.msg, t))
    }

    const input = query.args.command
    const cmd = client.commands.get(input)
    if (!cmd) return msg.reply(t('commands.unload.cannotfind', input))

    cmd.unload()
    return msg.reply(t('commands.unload.unloaded', cmd._name))
  }
}

module.exports = UnloadCommand
