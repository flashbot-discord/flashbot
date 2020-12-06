const Command = require('../_Command')

class GenerateBotInviteCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'generate-bot-invite',
      aliases: [
        'generatebotinvite', 'genbotinvite', '봇초대생성', '봇초대링크생성',
        'ㅎ둗ㄱㅁㅅㄷ-ㅠㅐㅅ-ㅑㅜ퍗ㄷ', 'ㅎ둗ㄱㅁㅅ듀ㅐ샤ㅜ퍗ㄷ', 'ㅎ두ㅠㅐ샤ㅜ퍗ㄷ', 'qhtcheotodtjd', 'qhtcheofldzmtodtjd'
      ],
      group: 'util',
      description: 'commands.generate-bot-invite.DESC',
      args: [
        {
          key: 'bot',
          type: ['snowflake', 'userMention'],
          optional: false
        }
      ]
    })
  }

  async run (client, msg, query, { t }) {
    let id

    if (!query.args.bot) return msg.reply(t('commands.generate-bot-invite.noArgs'))

    if (msg.mentions.users.size > 0) {
      const pending = msg.mentions.users.first()
      if (!pending.bot) return msg.reply(t('commands.generate-bot-invite.userProvided'))
      else id = pending.id
    } else id = query.args.bot

    const url = `https://discord.com/oauth2/authorize?client_id=${id}&permissions=2147483647&scope=bot`
    msg.channel.send(url)
  }
}

module.exports = GenerateBotInviteCommand
