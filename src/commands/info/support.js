const Command = require('../_Command')

class SupportCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'support',
      aliases: ['지원', '서포트', '녀ㅔㅔㅐㄱㅅ', 'wlfnjs', 'tjvhxm'],
      group: 'info'
    })

    this.inviteLink = 'https://discord.gg/epY3waF'
  }

  run (client, msg, _query, { t }) {
    return msg.reply(`${t('commands.support.text')}\n${this.inviteLink}`)
  }
}

module.exports = SupportCommand
