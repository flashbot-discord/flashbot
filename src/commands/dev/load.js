const Command = require('../_Command')
const path = require('path')

class LoadCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'load',
      aliases: ['ㅣㅐㅁㅇ'],
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
    const input = query.args.command

    const fullpath = path.join(client.commands.baseCmdPath, input + '.js')
    const cmd = require(fullpath)

    const r = client.commands.register(cmd, fullpath)

    if (!r) return msg.reply(t('commands.load.alreadyExists'))
    return msg.reply(t('commands.load.added', input))
  }
}

module.exports = LoadCommand
