/**
 * @name serverinfo.js
 * @description 서버 정보 보여주는 명령어
 */

const Command = require('../../classes/Command')

class ServerInfoCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'serverinfo',
      aliases: ['server-info', '서버정보'],
      description: '...',
      guildOnly: true
    })
  }

  async run (msg) {
    return msg.channel.send(client.locale.t('commands.serverinfo.result:'
    + 'Server Name: **%1$s**\nMembers in the Server: %2$s', locale, msg.guild.name, msg.guild.memberCount))
  }
}

module.exports = ServerInfoCommand
