/**
 * @name userinfo.js
 * @description 명령어를 입력한 이용자에 대한 정보를 보여줍니다.
 */

const { MessageEmbed } = require('discord.js')
const moment = require('moment-timezone')
const Command = require('../../structures/Command')
const Paginator = require('../../structures/Paginator')

class UserInfoCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'userinfo',
      aliases: ['user-info', '이용자정보', '사용자정보', '유저정보', 'ㅕㄴㄷ갸ㅜ래', 'ㅕㄴㄷㄱ-ㅑㅜ래', 'dldydwkwjdqh', 'tkdydwkwjdqh', 'dbwjwjdqh'],
      description: 'commands.userinfo.DESC:Shows user information.',
      group: 'info'
    })
  }

  async run (client, msg, _args, { t }) {
    const m = await msg.channel.send('Loading...')

    const data = []
    const user = msg.mentions.users.size > 0 ? msg.mentions.users.first() : msg.author
    const useEmbed = msg.channel.permissionsFor(client.user).has('EMBED_LINKS')

    const statusTxt = new Map([
      ['online', t('commands.userinfo.statusList.online')],
      ['idle', t('commands.userinfo.statusList.idle')],
      ['dnd', t('commands.userinfo.statusList.dnd')],
      ['offline', t('commands.userinfo.statusList.offline')]
    ])
    const status = statusTxt.get(user.presence.status)
    const clientStatus = this.getClientStat(user.presence.clientStatus, t)

    const createdAt = moment(user.createdAt).tz('Asia/Seoul').format(t('commands.userinfo.createdDate'))

    if (useEmbed) {
      data.push(this.generateEmbed(msg.author, user, t, 1, 2)
        .addField(':bust_in_silhouette: ' + t('commands.userinfo.name'), user.username, true)
        .addField(':hash: ' + t('commands.userinfo.usertag'), user.discriminator, true)
        .addField(':id: ' + t('commands.userinfo.id'), user.id)
        .addField(t('commands.userinfo.status'), status, true)
        .addField(t('commands.userinfo.clients'), clientStatus.join('\n'), true)
        .addField(':birthday: ' + t('commands.userinfo.createdAt'), createdAt)
      )

      data.push(this.generateEmbed(msg.author, user, t, 2, 2)
        .addField('Coming soon', 'Stay tuned!') // TODO WIP
      )
    } else {
      data.push(`${this.generateTextPage(msg.author, user, t, 1, 2)}\n\n` +
        `**:bust_in_silhouette: ${t('commands.userinfo.name')}**: ${user.username}\n` +
        `**:hash: ${t('commands.userinfo.usertag')}**: ${user.discriminator}\n` +
        `**:id: ${t('commands.userinfo.id')}**: ${user.id}\n` +
        `**${t('commands.userinfo.status')}**: ${status}\n` +
        `**${t('commands.userinfo.clients')}**: ${clientStatus.join(', ')}\n` +
        `**:birthday: ${t('commands.userinfo.createdAt')}**: ${createdAt}`
      )
    }

    const paginator = new Paginator(client, m, {
      contents: data,
      userID: msg.author.id
    })
    paginator.start()
  }

  getClientStat (clientStat, t) {
    if (clientStat == null) return null

    const text = Object.keys(clientStat).map((el) => t('commands.userinfo.clientStatus.' + el)) || t('commands.userinfo.clientOffline')
    return text
  }

  generateEmbed (author, user, t, currentPage, totalPage) {
    return new MessageEmbed()
      .setTitle(t('commands.userinfo.title', user.tag))
      .setDescription(`${t('commands.userinfo.page.' + currentPage)} (${t('commands.userinfo.pageText', currentPage, totalPage)})`)
      .setThumbnail(user.displayAvatarURL({ size: 1024, dynamic: true }))
      .setFooter(author.tag, author.displayAvatarURL())
  }

  generateTextPage (author, user, t, currentPage, totalPage) {
    return `**${t('commands.userinfo.title', user.tag)}**\n` +
        `${t('commands.userinfo.requestedBy', `<@${author.id}>`, author.tag)}\n` +
        `${t('commands.userinfo.page.1')} (${t('commands.userinfo.pageText', currentPage, totalPage)})`
  }
}

module.exports = UserInfoCommand
