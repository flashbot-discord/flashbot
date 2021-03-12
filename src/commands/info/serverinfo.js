/**
 * @name serverinfo.js
 * @description 서버 정보 보여주는 명령어
 */

const { MessageEmbed } = require('discord.js')
const moment = require('moment-timezone')
const Command = require('../_Command')

class ServerInfoCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'serverinfo',
      aliases: ['server-info', '서버정보', 'ㄴㄷㄱㅍㄷ갸ㅜ래', 'ㄴㄷㄱㅍㄷㄱ-ㅑㅜ래', 'tjqjwjdqh'],
      group: 'info',
      guildOnly: true
    })
  }

  async run (client, msg, _query, { t, tn }) {
    let data
    const guild = msg.guild
    const useEmbed = msg.channel.permissionsFor(client.user).has('EMBED_LINKS')

    const members = await guild.members.fetch()
    const [bots, users] = members.partition((member) => member.user.bot)
    const userCount = users.size
    const botCount = bots.size
    const memberCountText = `
:adult: ${tn('commands.serverinfo.memberCount.value.userCount', userCount)}
:robot: ${tn('commands.serverinfo.memberCount.value.botCount', botCount)}`

    const channelCache = guild.channels.cache
    const textChannelCount = channelCache.filter((c) => c.type === 'text').size
    const voiceChannelCount = channelCache.filter((c) => c.type === 'voice').size
    const categoryCount = channelCache.filter((c) => c.type === 'category').size
    const newsChannelCount = channelCache.filter((c) => c.type === 'news').size
    const channelCountText = `
:keyboard: ${tn('commands.serverinfo.channelCount.value.textChannelCount', textChannelCount)}
:microphone2: ${tn('commands.serverinfo.channelCount.value.voieChannelCount', voiceChannelCount)}
:file_folder: ${tn('commands.serverinfo.channelCount.value.categoryCount', categoryCount)}
:newspaper: ${tn('commands.serverinfo.channelCount.value.newsChannelCount', newsChannelCount)}`

    const verificationLevel = guild.verificationLevel
    const verificationLevelText = `
**${t(`verificationLevel.${verificationLevel}.name`)}** (\`${verificationLevel}\`)
${t(`verificationLevel.${verificationLevel}.description`)}`

    const is2FAReqOn = guild.mfaLevel === 1
    const twoFARequireForModText = `${is2FAReqOn ? ':white_check_mark:' : ':x:'} ${t(`commands.serverinfo.2faRequireForMod.value.${is2FAReqOn ? 'enabled' : 'disabled'}`)} (\`${guild.mfaLevel}\`)`

    const createdAt = moment(guild.createdAt)
      .tz('Asia/Seoul')
      .format(t('commands.serverinfo.createdAt.value'))

    const serverBoostLevelArr = [2, 15, 30, null]
    const currentServerBoost = guild.premiumSubscriptionCount
    const requiredBoostForNextLevel = serverBoostLevelArr[guild.premiumTier]
    const serverBoostText = `${t('commands.serverinfo.serverBoost.content.level', {
      level: guild.premiumTier
    })} | ${guild.premiumTier >= 3
        ? t('commands.serverinfo.serverBoost.content.maxLevel')
        : t('commands.serverinfo.serverBoost.content.forNextLevel', {
          requiredBoost: requiredBoostForNextLevel,
          currentBoost: currentServerBoost,
          boostForNextLevel: requiredBoostForNextLevel
        })}`

    if (useEmbed) {
      data = new MessageEmbed()
        .setTitle(t('commands.serverinfo.title', guild.name))
        .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
        .setFooter(msg.author.tag, msg.author.avatarURL({ dynamic: true, size: 1024 }))
        .addField(':desktop: ' + t('commands.serverinfo.name'), guild.name, true)
        .addField(':id: ' + t('commands.serverinfo.id'), guild.id, true)
        .addField(`:crown: ${t('commands.serverinfo.owner')}`, `<@${guild.owner.id}> ${guild.owner.user.tag} (${guild.owner.id})`)
        .addField(`:map: ${t('commands.serverinfo.region')}`, `${t('regions.' + guild.region)} (\`${guild.region}\`)`)
        .addField(':shield: ' + t('commands.serverinfo.verificationLevel'), verificationLevelText)
        .addField(':lock: ' + t('commands.serverinfo.2faRequireForMod.title'), twoFARequireForModText)
        .addField(':busts_in_silhouette: ' + tn('commands.serverinfo.memberCount.title', guild.memberCount), memberCountText, true)
        .addField(':tv: ' + tn('commands.serverinfo.channelCount.title', guild.channels.cache.size), channelCountText, true)
        .addField(':birthday: ' + t('commands.serverinfo.createdAt.title'), createdAt)
        .addField(':diamonds: ' + t('commands.serverinfo.serverBoost.title', {
          boost: currentServerBoost
        }), serverBoostText)
    } else {
      data = `
**${t('commands.serverinfo.title', guild.name)}**
(${t('commands.serverinfo.requestedBy', `<@${msg.author.id}>`, msg.author.tag)})

**:desktop: ${t('commands.serverinfo.name')}**: ${guild.name}
**:id: ${t('commands.serverinfo.id')}**: ${guild.id}
**:crown: ${t('commands.serverinfo.owner')}**: ${guild.owner.user.tag} (${guild.owner.id})
**:map: ${t('commands.serverinfo.region')}**: ${t('regions.' + guild.region)} (\`${guild.region}\`)
**:shield: ${t('commands.serverinfo.verificationLevel')}**: ${verificationLevelText}
**:lock: ${t('commands.serverinfo.2faRequireForMod.title')}**: ${twoFARequireForModText}

**:busts_in_silhouette: ${tn('commands.serverinfo.memberCount.title', guild.memberCount)}**
${memberCountText}

**:tv: ${tn('commands.serverinfo.channelCount.title', guild.channels.cache.size)}**
${channelCountText}

**:birthday: ${t('commands.serverinfo.createdAt.title')}**: ${createdAt}`
    }

    return msg.channel.send(data)
  }
}

module.exports = ServerInfoCommand
