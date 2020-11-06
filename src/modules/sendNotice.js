const { MessageEmbed } = require('discord.js')

module.exports = async (client, noticeText, requestedUser) => {
  const t = client.locale.t
  const locale = 'ko_KR' // TODO temp

  const embed = new MessageEmbed()
    .setTitle(':loudspeaker: ' + t('modules.sendNotice.embed.title', locale))
    .setDescription(noticeText)
    .setFooter(t('modules.sendNotice.embed.author', locale, requestedUser.tag), requestedUser.avatarURL())
    .addField(t('modules.sendNotice.embed.whyNoticeSentHere.title', locale), t('modules.sendNotice.embed.whyNoticeSentHere.content', locale))

  const guilds = client.guilds.cache
  guilds.forEach(async guild => {
    const availableChannels = guild.channels.cache.filter(ch => {
      return ['text', 'news'].includes(ch.type) &&
        ch.permissionsFor(client.user).has([
          'SEND_MESSAGES',
          'EMBED_LINKS'
        ])
    })
    if (availableChannels.size < 1) return

    // Find channels preferred to send notice
    // TODO refactor
    const preferredChannel1 = availableChannels.find(ch => {
      return typeof ch.topic === 'string' &&
        (
          ch.topic.includes('FlashBot공지') ||
          ch.topic.includes('FlashBot-공지')
        )
    })
    const preferredChannel2 = availableChannels.find(ch => {
      return ch.name.includes('봇공지') ||
        ch.name.includes('봇-공지')
    })

    let channel
    if (preferredChannel1) channel = preferredChannel1
    else if (preferredChannel2) channel = preferredChannel2
    else return

    await channel.send(embed)
    await wait()
  })
}

function wait () {
  const waitTime = 2000
  return new Promise((resolve, reject) => {
    setTimeout(resolve, waitTime)
  })
}
