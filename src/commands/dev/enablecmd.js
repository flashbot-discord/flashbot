const Command = require('../_Command')

class EnableCmdCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'enablecmd',
      aliases: ['enable', '명령어활성화', '두뮤ㅣㄷ', '두뮤ㅣㄷ층', 'audfuddjghkftjdghk'],
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
    if (!client.commands.has(query.args.command, true)) return msg.reply(t('commands.enablecmd.noSuchCommand'))

    const cmd = client.commands.get(query.args.command)
    if (cmd._enabled) return msg.reply(t('commands.enablecmd.alreadyEnabled'))

    cmd._enabled = true
    msg.reply(t('commands.enablecmd.complete', cmd._name))
  }
}

module.exports = EnableCmdCommand
