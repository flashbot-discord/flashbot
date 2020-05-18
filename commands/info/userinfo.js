/**
 * @name userinfo.js
 * @description 명령어를 입력한 이용자에 대한 정보를 보여줍니다.
 */

const { MessageEmbed } = require('discord.js')
const Command = require('../../classes/Command')

class UserInfoCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'userinfo',
      aliases: ['user-info', '이용자정보', '사용자정보', '유저정보', 'ㅕㄴㄷ갸ㅜ래', 'ㅕㄴㄷㄱ-ㅑㅜ래', 'dldydwkwjdqh', 'tkdydwkwjdqh', 'dbwjwjdqh'],
      description: 'commands.userinfo.DESC:Shows user information.',
      group: 'info'
    })
  }

  async run (client, msg, _args, locale) {
    const t = client.locale.t

    let data
    let user = msg.author
    const useEmbed = msg.channel.permissionsFor(client.user).has('EMBED_LINKS')
    if(useEmbed) {
      const statusTxt = new Map([
        ['online', t('commands.userinfo.statusList.online', locale)],
        ['idle', t('commands.userinfo.statusList.idle', locale)],
        ['dnd', t('commands.userinfo.statusList.dnd', locale)],
        ['offline', t('commands.userinfo.statusList.offline', locale)]
      ])
      const status = statusTxt.get(user.presence.status)

      const createdAt = t('commands.userinfo.createdDate', locale,
        user.createdAt.getFullYear(),
        user.createdAt.getMonth() + 1,
        user.createdAt.getDate(),
        user.createdAt.getHours(),
        user.createdAt.getMinutes(),
        user.createdAt.getSeconds()
      )

      data = new MessageEmbed()
        .setTitle(t('commands.userinfo.title', locale, user.tag))
        .setThumbnail(user.displayAvatarURL({ size: 1024 }))
        .setFooter(t('commands.userinfo.requestedBy', locale, msg.author.tag), user.displayAvatarURL())
        .addFields([
          { name: ':bust_in_silhouette: ' + t('commands.userinfo.name', locale), value: user.username, inline: true },
          { name: ':hash: ' + t('commands.userinfo.usertag', locale), value: user.discriminator, inline: true },
          { name: ':id: ' + t('commands.userinfo.id', locale), value: user.id, inline: true },
          { name: t('commands.userinfo.status', locale), value: status, inline: true },
          { name: t('commands.userinfo.clients', locale), value: this.getClientStat(user.presence.clientStatus, locale), inline: true },
          { name: ':inbox_tray: ' + t('commands.userinfo.createdAt', locale), value: createdAt, inline: true }
        ])
    } else {
      data = t('commands.userinfo.title')
    }

    return msg.channel.send(data)
  }

  getClientStat(clientStat, locale) {
    if(clientStat == null) return null

    const t = this._client.locale.t
    const text = Object.keys(clientStat).map((el) => this._client.locale.t('commands.userinfo.clientStatus.' + el, locale)).join(', ') || t('commands.userinfo.clientOffline', locale)
    return text
  }
}

module.exports = UserInfoCommand
