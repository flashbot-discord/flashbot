const Command = require('../../structures/Command')
const path = require('path')

class LoadCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'load',
      aliases: ['ㅣㅐㅁㅇ'],
      description: 'commands.load.DESC:Loads a command.',
      group: 'dev',
      owner: true,
      args: [
        {
          name: 'commands.load.args.command.NAME:command',
          type: 'common.string:string',
          description: 'commands.load.args.command.DESC:Command to load'
        }
      ]
    })
  }

  async run (client, msg, query, { t }) {
    if (query.args.length < 1) return msg.reply(Command.makeUsage(this, query.cmd, t))

    const input = query.args[0]

    const fullpath = path.join(client.commands.baseCmdPath, input + '.js')
    const cmd = require(fullpath)

    const r = client.commands.register(cmd, fullpath)

    if (!r) return msg.reply(t('commands.load.alreadyExists'))
    return msg.reply(t('commands.load.added', input))
  }
}

module.exports = LoadCommand
