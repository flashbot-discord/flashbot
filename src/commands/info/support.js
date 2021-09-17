const { MessageActionRow, MessageButton } = require('discord.js')

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
    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setStyle('LINK')
        .setURL(this.inviteLink)
        .setLabel(t('commands.support.button'))
    )

    return msg.reply({
      content: t('commands.support.text'),
      components: [row]
    })
  }
}

module.exports = SupportCommand
