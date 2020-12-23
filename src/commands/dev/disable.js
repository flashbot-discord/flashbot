const Command = require('../_Command')

class DisableCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'disable',
      aliases: ['비활성화', '얀뮤ㅣㄷ', 'qlghkftjdghk'],
      description: 'commands.disable.DESC',
      group: 'dev',
      owner: true,
      args: [
        {
          key: 'command',
          type: 'string',
          description: ''
        }
      ]
    })
  }

  async run (client, msg, query, { t }) {
    if (!client.commands.has(query.args.command, true)) return msg.reply(t('commands.disable.noSuchCommand'))

    const cmd = client.commands.get(query.args.command)
    if (!cmd._enabled) return msg.reply('commands.disable.alreadyDisabled')

    cmd._enabled = false
    msg.reply(t('commands.disable.complete', cmd._name))
  }
}

module.exports = DisableCommand
