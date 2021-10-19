const { MessageEmbed } = require('discord.js')

const Command = require('../_Command')
const { canSendEmbed } = require('../../components/permissions/checker')

class VoiceChannelListCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'vclist',
      aliases: ['vcl', '음성채널리스트', '음성채널목록', '음챗리스트', '음챗목록', 'ㅍ치ㅑㄴㅅ', 'ㅍ치', 'dmatjdcosjffltmxm', 'dmatjdcosjfahrfhr', 'dmacotfltmxm', 'dmacotahrfhr'],
      group: 'info'
    })
  }

  async run (client, msg, query, { t }) {
    const voiceChannels = msg.guild.channels.cache.filter(ch => ch.type === 'voice')
    const text = voiceChannels
      .sort((a, b) => a.rawPosition - b.rawPosition)
      .map(ch => `- ${ch.name} (\`${ch.id}\`)`)
      .join('\n')

    const title = t('commands.vclist.title')

    if (canSendEmbed(client.user, msg.channel)) {
      const embed = new MessageEmbed()
        .setTitle(title)
        .setDescription(text)
      await msg.channel.send(embed)
    } else {
      const output = `**${title}**\n\n${text}`
      msg.channel.send(output, {
        allowedMentions: {
          parse: []
        }
      })
    }
  }
}

module.exports = VoiceChannelListCommand
