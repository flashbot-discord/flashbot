const { MessageEmbed } = require('discord.js')
// const moment = require('moment-timezone')

const Command = require('../_Command')
const { canSendEmbed } = require('../../components/permissions/checker')

class UptimeCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'uptime',
      aliases: ['업타임', 'ㅕㅔ샤ㅡㄷ', 'djqxkdla'],
      group: 'info'
    })
  }

  async run (client, msg, _query, { t }) {
    const useEmbed = canSendEmbed(client.user, msg.channel)

    const uptime = Date.now() - client.readyAt.getTime()

    if (useEmbed) {
      const embed = new MessageEmbed()
        .setTitle(':clock1: ' + t('commands.uptime.title'))
        .setDescription(t('commands.uptime.description', uptime))
        .setFooter(msg.author.tag, msg.author.avatarURL())
        .setTimestamp()
      await msg.reply({ embeds: [embed] })
    } else {
      const output = t('commands.uptime.description', uptime)
      await msg.reply(output)
    }
  }
}

module.exports = UptimeCommand
