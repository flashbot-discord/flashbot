const { MessageEmbed } = require('discord.js')
// const moment = require('moment-timezone')

const Command = require('../_Command')

class UptimeCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'uptime',
      aliases: ['업타임', 'ㅕㅔ샤ㅡㄷ', 'djqxkdla'],
      description: 'commands.uptime.DESC',
      group: 'info'
    })
  }

  async run (client, msg, _query, { t }) {
    const useEmbed = msg.channel.permissionsFor(client.user).has('EMBED_LINKS')

    const uptime = Date.now() - client.readyAt.getTime()

    let output
    if (useEmbed) {
      const embed = new MessageEmbed()
        .setTitle(':clock1: ' + t('commands.uptime.title'))
        .setDescription(t('commands.uptime.description', uptime))
        .setFooter(msg.author.tag, msg.author.avatarURL())
        .setTimestamp()

      output = embed
    } else output = t('commands.uptime.description', uptime)

    msg.channel.send(output)
  }
}

module.exports = UptimeCommand
