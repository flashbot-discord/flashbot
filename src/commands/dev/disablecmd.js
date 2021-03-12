const Command = require('../_Command')

class DisableCmdCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'disablecmd',
      aliases: ['disable', '명령어비활성화', '얀뮤ㅣㄷ층', '얀뮤ㅣㄷ', 'audfuddjqlghkftjdghk'],
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
    if (!client.commands.has(query.args.command, true)) return msg.reply(t('commands.disablecmd.noSuchCommand'))

    const cmd = client.commands.get(query.args.command)
    if (!cmd._enabled) return msg.reply(t('commands.disablecmd.alreadyDisabled'))

    cmd._enabled = false
    msg.reply(t('commands.disablecmd.complete', cmd._name))
  }
}

module.exports = DisableCmdCommand
