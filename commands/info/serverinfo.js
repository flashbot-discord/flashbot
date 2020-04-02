/**
 * @name serverinfo.js
 * @description 서버 정보 보여주는 명령어
 */

const Command = require('../../classes/Command')

class ServerInfoCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'serverinfo',
      aliases: ['server-info', '서버정보', 'ㄴㄷㄱㅍㄷ갸ㅜ래', 'ㄴㄷㄱㅍㄷㄱ-ㅑㅜ래', 'tjqjwjdqh'],
      description: 'commands.serverinfo.DESC:Shows current server infomation.',
      guildOnly: true
    })
  }

  async run (client, msg, _query, locale) {
    return msg.channel.send(client.locale.t('commands.serverinfo.run:' +
    'Server Name: **%1$s**\nMembers in the Server: %2$s', locale, msg.guild.name, msg.guild.memberCount))
  }
}

module.exports = ServerInfoCommand
