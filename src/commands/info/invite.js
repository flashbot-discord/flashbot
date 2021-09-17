const { MessageActionRow, MessageButton } = require('discord.js')

const Command = require('../_Command')

class InviteCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'invite',
      aliases: ['초대', 'ㅑㅜ퍗ㄷ', 'cheo'],
      group: 'info'
    })

    this.inviteLink = 'https://discord.com/oauth2/authorize?client_id=580047857344708619&permissions=3525696&scope=bot'
    this.koreanbotsLink = 'https://koreanbots.dev/bots/580047857344708619'
  }

  async run (client, msg, guild, { t }) {
    const inviteBtn = new MessageButton()
      .setStyle('LINK')
      .setURL(this.inviteLink)
      .setLabel(t('commands.invite.inviteBtn'))
    const koreanbotsBtn = new MessageButton()
      .setStyle('LINK')
      .setURL(this.koreanbotsLink)
      .setLabel(t('commands.invite.koreanbotsBtn'))
    const row = new MessageActionRow().addComponents(
      inviteBtn,
      koreanbotsBtn
    )

    return msg.channel.send({
      content: t('commands.invite.text', this.inviteLink, this.koreanbotsLink),
      components: [row]
    })
  }
}

module.exports = InviteCommand
