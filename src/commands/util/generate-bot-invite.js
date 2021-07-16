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
      args: [
        {
          key: 'bot',
          type: 'user',
          optional: false
        }
      ]
    })
  }

  async run (client, msg, query, { t }) {
    if (!query.args.bot) return msg.reply(t('commands.generate-bot-invite.noArgs'))

    const url = `https://discord.com/oauth2/authorize?client_id=${query.args.bot.id}&permissions=2147483647&scope=bot`
    msg.channel.send(url)
  }
}

module.exports = GenerateBotInviteCommand
