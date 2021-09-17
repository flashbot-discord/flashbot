/**
 * @name serverinfo.js
 * @description 서버 정보 보여주는 명령어
 */

const { MessageEmbed } = require('discord.js')
const moment = require('moment-timezone')

const Command = require('../_Command')
const Paginator = require('../../structures/Paginator')
const { canSendEmbed } = require('../../components/permissions/checker')

const EMOJI = {
  // page 1
  name: ':desktop:',
  id: ':id:',
  owner: ':crown:',
  region: ':map:',
  shield: ':shield:',
  lock: ':lock:',
  person: ':busts_in_silhouette:',
  tv: ':tv:',
  createdAt: ':birthday:',
  boost: ':rocket:',

  // memberCount field
  person2: ':adult:',
  robot: ':robot:',

  // channelCount field
  textCh: ':keyboard:',
  voiceCh: ':microphone2:',
  categoryCh: ':file_folder:',
  announceCh: ':mega:',

  // page 2
  count: ':1234:'
}

class ServerInfoCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'serverinfo',
      aliases: ['server-info', 'si', '서버정보', 'ㄴㄷㄱㅍㄷ갸ㅜ래', 'ㄴㄷㄱㅍㄷㄱ-ㅑㅜ래', '냐', 'tjqjwjdqh'],
      group: 'info',
      guildOnly: true
    })
  }

  async run (client, msg, _query, { t, tn }) {
    const data = []
    const { guild } = msg
    const useEmbed = canSendEmbed(client.user, msg.channel)

    const m = await msg.channel.send('Loading...')

    // page 1
    const members = await guild.members.fetch()
    const [bots, users] = members.partition((member) => member.user.bot)
    const userCountText = tn('commands.serverinfo.memberCount.value.userCount', users.size)
    const botCountText = tn('commands.serverinfo.memberCount.value.botCount', bots.size)
    const memberCountText = `${EMOJI.person2} ${userCountText}\n` +
      `${EMOJI.robot} ${botCountText}`

    const channelCache = guild.channels.cache
    const textChannelCount = channelCache.filter((c) => c.type === 'text').size
    const voiceChannelCount = channelCache.filter((c) => c.type === 'voice').size
    const categoryCount = channelCache.filter((c) => c.type === 'category').size
    const newsChannelCount = channelCache.filter((c) => c.type === 'news').size
    const channelCountText = `${EMOJI.textCh} ${tn('commands.serverinfo.channelCount.value.textChannelCount', textChannelCount)}\n` +
      `${EMOJI.voiceCh} ${tn('commands.serverinfo.channelCount.value.voieChannelCount', voiceChannelCount)}\n` +
      `${EMOJI.categoryCh} ${tn('commands.serverinfo.channelCount.value.categoryCount', categoryCount)}\n` +
      `${EMOJI.announceCh} ${tn('commands.serverinfo.channelCount.value.newsChannelCount', newsChannelCount)}`

    const verificationLevel = guild.verificationLevel
    const verificationLevelText = `**${t(`verificationLevel.${verificationLevel}.name`)}** (\`${verificationLevel}\`)\n` +
      `  - ${t(`verificationLevel.${verificationLevel}.description`)}`

    const is2FAReqOn = guild.mfaLevel === 1
    const twoFARequireForModText = `${is2FAReqOn ? ':white_check_mark:' : ':x:'} ${t(`commands.serverinfo.2faRequireForMod.value.${is2FAReqOn ? 'enabled' : 'disabled'}`)} (\`${guild.mfaLevel}\`)`

    const createdAt = moment(guild.createdAt)
      .tz('Asia/Seoul')
      .format(t('commands.serverinfo.createdAt.value'))

    const serverBoostLevelArr = [2, 7, 14, null]
    const currentServerBoost = guild.premiumSubscriptionCount
    const requiredBoostForNextLevel = serverBoostLevelArr[guild.premiumTier]
    const serverBoostText = `${t('commands.serverinfo.serverBoost.content.level', {
      level: guild.premiumTier
    })} | ${guild.premiumTier >= 3
        ? t('commands.serverinfo.serverBoost.content.maxLevel')
        : t('commands.serverinfo.serverBoost.content.forNextLevel', {
          requiredBoost: requiredBoostForNextLevel - currentServerBoost,
          currentBoost: currentServerBoost,
          boostForNextLevel: requiredBoostForNextLevel
        })}`

    // page 2
    const roleMgr = await guild.roles.fetch()

    // page 3
    const emojis = guild.emojis.cache
  
    // <a:char(max 32):id(~19)> 3 + 32 + 1 + 19 + 1 = max 56 chars
    const emojiCountLimit = useEmbed ? 68 : 32 // 56 * count + α
    const emojiText = emojis
      .first(emojiCountLimit)
      .map(e => e.toString())
      .join(' ')
    const remainingEmojiCount = emojis.size - emojiCountLimit

    const sharedText = {
      // page 1
      name: t('commands.serverinfo.name'),
      id: t('commands.serverinfo.id'),
      owner: t('commands.serverinfo.owner'),
      region: t('commands.serverinfo.region'),
      verificationLevel: t('commands.serverinfo.verificationLevel'),
      '2faRequireForMod': t('commands.serverinfo.2faRequireForMod.title'),
      memberCount: tn('commands.serverinfo.memberCount.title', guild.memberCount),
      channelCount: tn('commands.serverinfo.channelCount.title', guild.channels.cache.size),
      createdAt: t('commands.serverinfo.createdAt.title'),
      boost: tn('commands.serverinfo.serverBoost.title', currentServerBoost),

      // page 2
      roleCount: t('commands.serverinfo.roleCount'),

      // page 3
      emojiCount: t('commands.serverinfo.emojiCount')
    }

    const totalPages = 3

    if (useEmbed) {
      // basic information
      const embed1 = this.generateEmbed(msg.author, guild, t, 1, totalPages)
        .addField(`${EMOJI.name} ${sharedText.name}`, guild.name, true)
        .addField(`${EMOJI.id} ${sharedText.id}`, guild.id, true)
        .addField(`${EMOJI.owner} ${sharedText.owner}`, `<@${guild.owner.id}> ${guild.owner.user.tag} (${guild.owner.id})`)
        .addField(`${EMOJI.region} ${sharedText.region}`, `${t('regions.' + guild.region)} (\`${guild.region}\`)`)
        .addField(`${EMOJI.shield} ${sharedText.verificationLevel}`, verificationLevelText)
        .addField(`${EMOJI.lock} ${sharedText['2faRequireForMod']}`, twoFARequireForModText)
        .addField(`${EMOJI.person} ${sharedText.memberCount}`, memberCountText, true)
        .addField(`${EMOJI.tv} ${sharedText.channelCount}`, channelCountText, true)
        .addField(`${EMOJI.createdAt} ${sharedText.createdAt}`, createdAt)
        .addField(`${EMOJI.boost} ${sharedText.boost}`, serverBoostText)
      data.push(embed1)

      const roleText = roleMgr.cache
        .map(rl => rl.toString())
        .join(', ')

      // roles
      const embed2 = this.generateEmbed(msg.author, guild, t, 2, totalPages)
      embed2.setDescription(`${embed2.description}\n\n${roleText}`)
        .addField(`${EMOJI.count} ${sharedText.roleCount}`, roleMgr.cache.size)
      data.push(embed2)

      // custom emojis
      const embed3 = this.generateEmbed(msg.author, guild, t, 3, totalPages)
      embed3.setDescription(`${embed3.description}\n\n${emojiText}${remainingEmojiCount > 0 ? ` + ${remainingEmojiCount}` : ''}`)
        .addField(`${EMOJI.count} ${sharedText.emojiCount}`, emojis.size)
      data.push(embed3)
    } else {
      const memberCountText_ = memberCountText
        .split('\n')
        .reduce((acc, cur) => `${acc}  - ${cur}\n`, '')
      const channelCountText_ = channelCountText
        .split('\n')
        .reduce((acc, cur) => `${acc}  - ${cur}\n`, '')

      // basic information
      const page1 = `${this.generateTextPage(msg.author, guild, t, 1, totalPages)}\n\n` +
        `**${EMOJI.name} ${sharedText.name}**: ${guild.name}\n` +
        `**${EMOJI.id} ${sharedText.id}**: ${guild.id}\n` +
        `**${EMOJI.owner} ${sharedText.owner}**: ${guild.owner.user.tag} (${guild.owner.id})\n` +
        `**${EMOJI.region} ${sharedText.region}**: ${t('regions.' + guild.region)} (\`${guild.region}\`)\n` +
        `**${EMOJI.shield} ${sharedText.verificationLevel}**: ${verificationLevelText}\n` +
        `**${EMOJI.lock} ${sharedText['2faRequireForMod']}**: ${twoFARequireForModText}\n\n` +
        `**${EMOJI.person} ${sharedText.memberCount}**\n${memberCountText_}\n\n` +
        `**${EMOJI.tv} ${sharedText.channelCount}**\n${channelCountText_}\n\n` +
        `**${EMOJI.createdAt} ${sharedText.createdAt}**: ${createdAt}\n` +
        `**${EMOJI.boost} ${sharedText.boost}**: ${serverBoostText}`
      data.push(page1)

      const roleCountLimit = 75 // 23 * 75 = 1725 + α
      const roleText = roleMgr.cache
        .first(roleCountLimit)
        .map(rl => rl.toString())
        .join(', ')
      const remainingRoleCount = roleMgr.cache.size - roleCountLimit

      // roles
      const page2 = `${this.generateTextPage(msg.author, guild, t, 2, totalPages)}\n\n` +
        `${roleText}${remainingRoleCount > 0 ? ` + ${remainingRoleCount}` : ''} = ${roleMgr.cache.size}`
      data.push(page2)

      // custom emojis
      // <a:char(max 32):id(~19)> 3 + 32 + 1 + 19 + 1 = max 56 chars
      const page3 = `${this.generateTextPage(msg.author, guild, t, 3, totalPages)}\n\n` +
        `${emojiText}${remainingEmojiCount > 0 ? ` + ${remainingEmojiCount}` : ''} = ${emojis.size}`
      data.push(page3)
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
    paginator.start()
  }

  generateEmbed (author, guild, t, currentPage, totalPage) {
    return new MessageEmbed()
      .setTitle(`${t('commands.serverinfo.title', guild.name)}`)
      .setDescription(`${t('commands.serverinfo.page.' + currentPage)} (${t('commands.serverinfo.pageText', currentPage, totalPage)})`)
      .setThumbnail(guild.iconURL({ size: 1024, dynamic: true }))
      .setFooter(author.tag, author.displayAvatarURL())
  }

  generateTextPage (author, guild, t, currentPage, totalPage) {
    return `**${t('commands.serverinfo.title', guild.name)}**\n` +
      `(${t('commands.serverinfo.requestedBy', `<@${author.id}>`, author.tag)})\n\n` +
      `${t('commands.serverinfo.page.' + currentPage)} (${t('commands.serverinfo.pageText', currentPage, totalPage)})`
  }
}

module.exports = ServerInfoCommand
