const Command = require('../../structures/Command')

class InviteCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'invite',
      aliases: ['초대', 'ㅑㅜ퍗ㄷ', 'cheo'],
      description: 'commands.invite.DESC',
      group: 'info'
    })

    this.inviteLink = 'https://discord.com/oauth2/authorize?client_id=580047857344708619&permissions=3525696&scope=bot'
    this.koreanbotsLink = 'https://koreanbots.dev/bots/580047857344708619'
  }

  async run (client, msg, guild, locale) {
    const t = client.locale.t

    return msg.channel.send(t('commands.invite.text', locale, this.inviteLink, this.koreanbotsLink))
  }
}

module.exports = InviteCommand
