const Command = require('../../structures/Command')

class GenerateBotInviteCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'generate-bot-invite',
      aliases: [
        'generatebotinvite', 'genbotinvite', '봇초대생성', '봇초대링크생성',
        'ㅎ둗ㄱㅁㅅㄷ-ㅠㅐㅅ-ㅑㅜ퍗ㄷ', 'ㅎ둗ㄱㅁㅅ듀ㅐ샤ㅜ퍗ㄷ', 'ㅎ두ㅠㅐ샤ㅜ퍗ㄷ', 'qhtcheotodtjd', 'qhtcheofldzmtodtjd'
      ],
      group: 'util',
      description: 'commands.generate-bot-invite.DESC'
    })
  }

  async run (client, msg, query, { t }) {
    let id

    if (query.args.length !== 1) return msg.reply(t('commands.generate-bot-invite.noArgs'))

    if (msg.mentions.users.size > 0) {
      const pending = msg.mentions.users.first()
      if (!pending.bot) return msg.reply(t('commands.generate-bot-invite.userProvided'))
      else id = pending.id
    } else if (this.validateID(query.args[0])) id = query.args[0]
    else return msg.reply(t('commands.generate-bot-invite.invalidID'))

    const url = `https://discord.com/oauth2/authorize?client_id=${id}&permissions=2147483647&scope=bot`
    msg.channel.send(url)
  }

  validateID (id) {
    return typeof id === 'string' &&
      /^[0-9]{17,19}$/.test(id)
  }
}

module.exports = GenerateBotInviteCommand
