const { MessageEmbed } = require('discord.js')

const Command = require('../_Command')
const sendNotice = require('../../modules/sendNotice')

class NoticeCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'notice',
      aliases: ['공지', 'ㅜㅐ샻ㄷ', 'rhdwl'],
      description: 'commands.notice.DESC',
      group: 'dev',
      owner: true,
      clientPerms: ['EMBED_LINKS', 'ADD_REACTIONS'],
      args: [
        {
          key: 'text',
          type: 'text',
          optional: false
        }
      ]
    })
  }

  async run (client, msg, query, { t }) {
    const text = query.args.text

    if (text.length < 1) return msg.reply(t('commands.notice.error.noText'))

    const embed = new MessageEmbed()
      .setTitle(':loudspeaker: ' + t('commands.notice.previewEmbed.title'))
      .setDescription(text)

    const botMsg = await msg.reply(t('commands.notice.confirm'), embed)

    botMsg.react('✅')
    botMsg.react('❌')

    const collected = await botMsg.awaitReactions((reaction, user) => {
      if (user.id !== msg.author.id) return false
      else return ['✅', '❌'].includes(reaction.emoji.name)
    }, {
      max: 1,
      time: 1000 * 30
    })

    if (collected.size < 1) {
      // Timeout
      return msg.reply(t('commands.notice.timeOut'))
    } else {
      const emoji = collected.first().emoji.name
      if (emoji === '❌') {
        // User cancelled
        return msg.reply(t('commands.notice.cancelled'))
      } else if (emoji === '✅') {
        // Run
        // TODO show live status
        msg.reply(t('commands.notice.started'))
        await sendNotice(msg, t, text)
      }
    }
  }
}

module.exports = NoticeCommand
