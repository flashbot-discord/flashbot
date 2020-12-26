const { MessageEmbed } = require('discord.js')

module.exports = async (msg, t, noticeText) => {
  const client = msg.client
  const requestedUser = msg.author
  const locale = 'ko_KR' // TODO temp

  const tt = (phrase, ...args) => t({ phrase, locale }, ...args)

  const embed = new MessageEmbed()
    .setTitle(':loudspeaker: ' + tt('modules.sendNotice.embed.title'))
    .setDescription(noticeText)
    .setFooter(tt('modules.sendNotice.embed.author', requestedUser.tag), requestedUser.avatarURL())
    .addField(tt('modules.sendNotice.embed.whyNoticeSentHere.title'), tt('modules.sendNotice.embed.whyNoticeSentHere.content'))

  const guilds = client.guilds.cache
  for await (const [_, guild] of guilds) {
    const availableChannels = guild.channels.cache.filter(ch => {
      return ['text', 'news'].includes(ch.type) &&
        ch.permissionsFor(client.user).has([
          'SEND_MESSAGES',
          'EMBED_LINKS'
        ])
    })
    if (availableChannels.size < 1) continue

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
    else continue

    await channel.send(embed)
    await wait()
  }
}

function wait () {
  const waitTime = 2000
  return new Promise((resolve, reject) => {
    setTimeout(resolve, waitTime)
  })
}
