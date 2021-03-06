const Command = require('../../classes/Command')

class ReloadCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'reload',
      aliases: ['ㄱ디ㅐㅁㅇ'],
      description: 'commands.reload.DESC:reloads a command',
      group: 'dev',
      owner: true,
      args: [
        {
          name: 'commands.reload.args.command.NAME:command',
          type: 'common.string:string',
          description: 'commands.reload.args.command.DESC:Command to reload'
        }
      ]
    })
  }

  async run (client, msg, query, locale) {
    const t = client.locale.t

    if (query.args.length < 1) return msg.reply(Command.makeUsage(this, query.cmd, locale))

    const input = query.args[0]
    const cmd = client.commands.get(input)
    if (!cmd) return msg.reply(t('commands.reload.cannotfind', locale, input))

    cmd.reload()
    return msg.reply(t('commands.reload.reloaded', locale, cmd._name))
  }
}

module.exports = ReloadCommand
