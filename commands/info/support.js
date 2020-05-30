const Command = require('../../classes/Command')

class SupportCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'support',
      aliases: ['지원', '서포트', '녀ㅔㅔㅐㄱㅅ', 'wlfnjs', 'tjvhxm'],
      description: 'commands.support.DESC:Gives the link to the support server.',
      group: 'info'
    })

    this.inviteLink = 'https://discord.gg/epY3waF'
  }

  run(client, msg, _query, locale) {
    return msg.reply(client.locale.t('commands.support.text', locale) + '\n' + this.inviteLink)
  }
}

module.exports = SupportCommand
