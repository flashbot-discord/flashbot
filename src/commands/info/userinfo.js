/**
 * @name userinfo.js
 * @description 명령어를 입력한 이용자에 대한 정보를 보여줍니다.
 */

const { MessageEmbed } = require('discord.js')

const Command = require('../_Command')
const Paginator = require('../../structures/Paginator')
const { canSendEmbed } = require('../../components/permissions/checker')

const EMOJI = {
  default: ':small_blue_diamond:',
  bot: ':robot:',
  person: ':bust_in_silhouette:',
  hashtag: ':hash:',
  id: ':id:',
  cake: ':birthday:',
  crown: ':crown:',
  check: ':white_check_mark:',
  x: ':x:',
  enter: ':inbox_tray:',
  nameBadge: ':name_badge:',
  highest: ':arrow_up:',
  color: ':paintbrush:'
}

class UserInfoCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'userinfo',
      aliases: ['user-info', 'ui', '이용자정보', '사용자정보', '유저정보', 'ㅕㄴㄷ갸ㅜ래', 'ㅕㄴㄷㄱ-ㅑㅜ래', 'ㅕㅑ', 'dldydwkwjdqh', 'tkdydwkwjdqh', 'dbwjwjdqh'],
      group: 'info',
      args: [
        {
          key: 'user',
          type: 'user',
          optional: true
        }
      ]
    })
  }

  async run (client, msg, query, { t }) {
    const m = await msg.reply('Loading...')

    const data = []
    const user = query.args.user ?? msg.author
    const useEmbed = canSendEmbed(client.user, msg.channel)

    const sharedText = {
      notInGuild: t('commands.userinfo.notInGuild'),
      memberNotExist: t('commands.userinfo.memberNotExist'),

      // page 1
      name: t('commands.userinfo.name'),
      userTag: t('commands.userinfo.usertag'),
      id: t('commands.userinfo.id'),
      createdAt: t('commands.userinfo.createdAt'),

      // page 2
      status: t('commands.userinfo.status'),
      clients: t('commands.userinfo.clients'),
      nickname: t('commands.userinfo.nickname'),
      isServerOwner: t('commands.userinfo.isServerOwner'),
      serverJoinedAt: t('commands.userinfo.serverJoinedAt'),

      // page 3
      highestRole: t('commands.userinfo.highestRole'),
      highestRoleColor: t('commands.userinfo.highestRoleColor')
    }

    // NOTE: account creation date
    const createdAt = `<t:${Math.floor(user.createdAt.getTime() / 1000)}:F>`

    // NOTE: Guild-only
    let member

    let statusText
    let clientStatusText

    let nickname
    let isServerOwner
    let joinedAt

    let roleText
    let highestRole

    if (msg.guild) {
      member = await msg.guild.members.fetch(user.id)
        .catch(() => { member = null })

      if (member) {
        // NOTE: activity status
        const { status, clientStatus } = member.presence
        statusText = t('commands.userinfo.statusList.' + status)
        clientStatusText = status !== 'offline' && !user.bot ? this.getClientStat(clientStatus, t) : ['N/A']

        nickname = member.nickname ?? '\u200b'
        isServerOwner = EMOJI[msg.guild.ownerId === user.id ? 'check' : 'x']
        joinedAt = `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:F>`

        await msg.guild.roles.fetch() // cache all roles in a server
        const memberRoles = member.roles.cache
        const roleCountLimit = useEmbed ? 150 : 75 // 150 - max role count
        roleText = memberRoles.first(roleCountLimit)
          .reduce((acc, role) => `${acc} ${role.toString()}`, '')
        highestRole = member.roles.highest
      }
    }

    const totalPages = member != null ? 3 : 2 // NOTE: first number = total pages if member is available

    if (useEmbed) {
      // basic information
      const embed1 = this.generateEmbed(msg.author, user, t, 1, totalPages)
        .addField(`${EMOJI.person} ${sharedText.name}`, user.username, true)
        .addField(`${EMOJI.hashtag} ${sharedText.userTag}`, user.discriminator, true)
        .addField(`${EMOJI.id} ${sharedText.id}`, user.id)
        .addField(`${EMOJI.cake} ${sharedText.createdAt}`, createdAt)
      data.push(embed1)

      // server related values
      const embed2 = this.generateEmbed(msg.author, user, t, 2, totalPages)
      if (!msg.guild) {
        embed2.setDescription(embed2.description + `\n\n${sharedText.notInGuild}`)
      } else if (!member) {
        embed2.setDescription(embed2.description + `\n\n${sharedText.memberNotExist}`)
      } else {
        embed2.addField(`${EMOJI.default} ${sharedText.status}`, statusText, true)
          .addField(`${EMOJI.default} ${sharedText.clients}`, clientStatusText.join('\n'), true)
          .addField(`${EMOJI.nameBadge} ${sharedText.nickname}`, nickname)
          .addField(`${EMOJI.crown} ${sharedText.isServerOwner}`, isServerOwner)
          .addField(`${EMOJI.enter} ${sharedText.serverJoinedAt}`, joinedAt)
      }

      data.push(embed2)

      if (member) {
        // member role values
        const embed3 = this.generateEmbed(msg.author, user, t, 3, totalPages)
        embed3.setDescription(`${embed3.description}\n\n${roleText}`)
          .addField(`${EMOJI.highest} ${sharedText.highestRole}`, `${highestRole.toString()} ${highestRole.name} (${highestRole.id})`)
          .addField(`${EMOJI.color} ${sharedText.highestRoleColor}`, highestRole.hexColor)

        data.push(embed3)
      }
    } else {
      const page1 = `${this.generateTextPage(msg.author, user, t, 1, totalPages)}\n\n` +
        `**${EMOJI.person} ${sharedText.name}**: ${user.username}\n` +
        `**${EMOJI.hashtag} ${sharedText.userTag}**: ${user.discriminator}\n` +
        `**${EMOJI.id} ${sharedText.id}**: ${user.id}\n` +
        `**${EMOJI.cake} ${sharedText.createdAt}**: ${createdAt}`
      data.push(page1)

      let page2 = `${this.generateTextPage(msg.author, user, t, 2, totalPages)}\n\n`
      if (!msg.guild) {
        page2 += sharedText.notInGuild
      } else if (!member) {
        page2 += sharedText.memberNotExist
      } else {
        page2 += `**${EMOJI.default} ${sharedText.status}**: ${statusText}\n` +
          `**${EMOJI.default} ${sharedText.clients}**: ${clientStatusText.join(', ')}\n` +
          `**${EMOJI.nameBadge} ${sharedText.nickname}**: ${nickname}\n` +
          `**${EMOJI.crown} ${sharedText.isServerOwner}**: ${isServerOwner}\n` +
          `**${EMOJI.enter} ${sharedText.serverJoinedAt}**: ${joinedAt}`
      }

      data.push(page2)

      if (member) {
        const page3 = `${this.generateTextPage(msg.author, user, t, 3, totalPages)}\n\n${roleText}\n\n` +
          `**${EMOJI.highest} ${sharedText.highestRole}**: ${highestRole.toString()} ${highestRole.name} (${highestRole.id})\n` +
          `**${EMOJI.color} ${sharedText.highestRoleColor}**: ${highestRole.hexColor}`

        data.push(page3)
      }
    }

    const paginator = new Paginator(client, m, {
      contents: data,
      userID: msg.author.id,
      messageOptions: {
        allowedMentions: {
          parse: ['users'] // user mention only
        }
      }
    })
    await paginator.start()
  }

  getClientStat (clientStat, t) {
    const text = Object.keys(clientStat).map((el) => t('commands.userinfo.clientStatus.' + el)) || t('commands.userinfo.clientOffline')
    return text
  }

  generateEmbed (author, user, t, currentPage, totalPage) {
    return new MessageEmbed()
      .setTitle(`${user.bot ? EMOJI.bot : ''} ${t('commands.userinfo.title', user.tag)}`)
      .setDescription(`${t('commands.userinfo.page.' + currentPage)} (${t('commands.userinfo.pageText', currentPage, totalPage)})`)
      .setThumbnail(user.displayAvatarURL({ size: 1024, dynamic: true }))
      .setFooter(author.tag, author.displayAvatarURL())
  }

  generateTextPage (author, user, t, currentPage, totalPage) {
    return `${user.bot ? EMOJI.bot : ''} **${t('commands.userinfo.title', user.tag)}**\n` +
      `(${t('commands.userinfo.requestedBy', `<@${author.id}>`, author.tag)})\n\n` +
      `${t('commands.userinfo.page.' + currentPage)} (${t('commands.userinfo.pageText', currentPage, totalPage)})`
  }
}

module.exports = UserInfoCommand
