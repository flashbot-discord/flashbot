const Command = require('../_Command')

class ReloadCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'reload',
      aliases: ['리로드', 'ㄱ디ㅐㅁㅇ', 'flfhem'],
      description: 'commands.reload.DESC:reloads a command',
      group: 'dev',
      owner: true,
      args: {
        all: {
          aliases: ['a', '모두'],
          type: 'boolean',
          description: '',
          optional: true
        },
        _: [
          {
            key: 'command',
            type: 'string',
            description: 'commands.reload.args.command.DESC:Command to reload'
          }
        ]
      }
    })
  }

  async run (client, msg, query, { t }) {
    if (!query.args.all && !query.args.command) return msg.reply(Command.makeUsage(this, query.cmd))

    if (query.args.all) {
      const list = client.commands.commands.clone()
      const errCmds = []
      list.forEach(cmd => {
        try {
          cmd.reload()
        } catch (e) {
          errCmds.push(cmd._name)
        }
      })

      const successCmdCount = list.size - errCmds.length

      // TODO: English plural text support
      let result = t('commands.reload.allReload.result', list.size, successCmdCount)
      if (errCmds.length > 0) result += '\n' + t('commands.reload.allReload.failedCmds', errCmds.length, errCmds.join('`, `'))

      return msg.reply(result)
    }

    const input = query.args.command
    const cmd = client.commands.get(input)
    if (!cmd) return msg.reply(t('commands.reload.cannotfind', input))

    cmd.reload()
    return msg.reply(t('commands.reload.reloaded', cmd._name))
  }
}

module.exports = ReloadCommand
