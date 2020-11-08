const Command = require('../../structures/Command')

class SupportCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'support',
      aliases: ['지원', '서포트', '녀ㅔㅔㅐㄱㅅ', 'wlfnjs', 'tjvhxm'],
      description: 'commands.support.DESC:Gives the link to the support server.',
      group: 'info'
    })

    this.inviteLink = 'https://discord.gg/epY3waF'
  }

  run (client, msg, _query, { t }) {
    return msg.reply(t('commands.support.text') + '\n' + this.inviteLink)
  }
}

module.exports = SupportCommand
