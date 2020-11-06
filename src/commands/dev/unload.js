const Command = require('../../structures/Command')

class UnloadCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'unload',
      aliases: ['ㅕㅟㅐㅁㅇ'],
      description: 'commands.unload.DESC:Unloads a command.',
      group: 'dev',
      owner: true,
      args: [
        {
          name: 'commands.unload.args.command.NAME:command',
          type: 'common.string:string',
          description: 'commands.unload.args.command.DESC:Command to unload'
        }
      ]
    })
  }

  async run (client, msg, query, locale) {
    const t = client.locale.t

    if (query.args.length < 1) {
      return msg.reply(Command.makeUsage(this, query.msg, locale))
    }

    const input = query.args[0]
    const cmd = client.commands.get(input)
    if (!cmd) return msg.reply(t('commands.unload.cannotfind', locale, input))

    cmd.unload()
    return msg.reply(t('commands.unload.unloaded', locale, cmd._name))
  }
}

module.exports = UnloadCommand
