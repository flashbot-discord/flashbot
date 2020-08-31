/**
 * @name userinfo.js
 * @description 명령어를 입력한 이용자에 대한 정보를 보여줍니다.
 */

const { MessageEmbed } = require('discord.js')
const moment = require('moment-timezone')
const Command = require('../../classes/Command')
const Paginator = require('../../classes/Paginator')

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
    const m = await msg.channel.send('Loading...')

    const data = []
    const user = msg.mentions.users.size > 0 ? msg.mentions.users.first() : msg.author
    const useEmbed = msg.channel.permissionsFor(client.user).has('EMBED_LINKS')

    const statusTxt = new Map([
      ['online', t('commands.userinfo.statusList.online', locale)],
      ['idle', t('commands.userinfo.statusList.idle', locale)],
      ['dnd', t('commands.userinfo.statusList.dnd', locale)],
      ['offline', t('commands.userinfo.statusList.offline', locale)]
    ])
    const status = statusTxt.get(user.presence.status)
    const clientStatus = this.getClientStat(user.presence.clientStatus, locale)

    const createdAt = moment(user.createdAt).tz('Asia/Seoul').format(t('commands.userinfo.createdDate', locale))

    if (useEmbed) {
      data.push(this.generateEmbed(msg.author, user, locale, 1, 2)
        .addField(':bust_in_silhouette: ' + t('commands.userinfo.name', locale), user.username, true)
        .addField(':hash: ' + t('commands.userinfo.usertag', locale), user.discriminator, true)
        .addField(':id: ' + t('commands.userinfo.id', locale), user.id)
        .addField(t('commands.userinfo.status', locale), status, true)
        .addField(t('commands.userinfo.clients', locale), clientStatus.join('\n'), true)
        .addField(':birthday: ' + t('commands.userinfo.createdAt', locale), createdAt)
      )

      data.push(this.generateEmbed(msg.author, user, locale, 2, 2)
        .addField('Coming soon', 'Stay tuned!') // TODO WIP
      )
    } else {
      data.push(`${this.generateTextPage(msg.author, user, locale, 1, 2)}\n\n` +
        `**:bust_in_silhouette: ${t('commands.userinfo.name', locale)}**: ${user.username}\n` +
        `**:hash: ${t('commands.userinfo.usertag', locale)}**: ${user.discriminator}\n` +
        `**:id: ${t('commands.userinfo.id', locale)}**: ${user.id}\n` +
        `**${t('commands.userinfo.status', locale)}**: ${status}\n` +
        `**${t('commands.userinfo.clients', locale)}**: ${clientStatus.join(', ')}\n` +
        `**${t('commands.userinfo.createdAt', locale)}**: ${createdAt}`
      )
    }

    const paginator = new Paginator(client, m, {
      contents: data,
      userID: msg.author.id
    })
    paginator.start()
  }

  getClientStat (clientStat, locale) {
    if (clientStat == null) return null

    const t = this._client.locale.t
    const text = Object.keys(clientStat).map((el) => this._client.locale.t('commands.userinfo.clientStatus.' + el, locale)) || t('commands.userinfo.clientOffline', locale)
    return text
  }

  generateEmbed (author, user, locale, currentPage, totalPage) {
    const t = this._client.locale.t
    return new MessageEmbed()
      .setTitle(t('commands.userinfo.title', locale, user.tag))
      .setDescription(`${t('commands.userinfo.page.' + currentPage, locale)} (${t('commands.userinfo.pageText', locale, currentPage, totalPage)})`)
      .setThumbnail(user.displayAvatarURL({ size: 1024, dynamic: true }))
      .setFooter(author.tag, author.displayAvatarURL())
  }

  generateTextPage (author, user, locale, currentPage, totalPage) {
    const t = this._client.locale.t
    return `**${t('commands.userinfo.title', locale, user.tag)}**\n` +
        `${t('commands.userinfo.requestedBy', locale, `<@${author.id}>`, author.tag)}\n` +
        `${t('commands.userinfo.page.1', locale)} (${t('commands.userinfo.pageText', locale, currentPage, totalPage)})`
  }
}

module.exports = UserInfoCommand
