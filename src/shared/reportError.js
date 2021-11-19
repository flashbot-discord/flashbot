const { Interaction } = require('discord.js')
const { WebhookClient, MessageEmbed } = require('discord.js')

const loggerGen = require('./logger')

module.exports = async (err, msgOrInteraction, t, logPos) => {
  const { client } = msgOrInteraction
  const isSlashCommand = msgOrInteraction instanceof Interaction
  const executor = isSlashCommand ? msgOrInteraction.user : msgOrInteraction.author
  const guild = msgOrInteraction.guild
  const channel = msgOrInteraction.channel

  // 빗금 커맨드인 경우 내용 처리 방식이 다름
  // 임시로 내용 안나오게 만듬
  if (isSlashCommand) msgOrInteraction.content = '*Unavailable on slash command execution.*'

  const logger = loggerGen(logPos)
  logger.error(err.stack)

  const errorText = t('ClientError.error', err.message, err.uid)
  msgOrInteraction.reply(errorText) // TODO: without translation
    .catch(async e => {
      // cannot send error on server channel, so try sending to dm
      // TODO: different error notify text
      await executor.send(errorText)
    }).catch(async e => {
      // cannot send to dm also. so drop
    })

  // NOTE: Webhook report
  const { id, token, enable, mentionOwner } = client.config.errorWebhook
  if (!enable) return

  const webhookClient = new WebhookClient({ id, token })

  const errStack = err.stack.length > 4000 ? (err.stack.slice(0, 4000) + '...') : err.stack
  const msgContent = msgOrInteraction.content.length > 1500 ? (msgOrInteraction.content.slice(0, 1500) + '...') : msgOrInteraction.content
  const embed = new MessageEmbed()
    .setTitle('봇 오류 / Bot Error')
    .setDescription(errStack)
    .addField('서버 / Server', guild ? `${guild.name} (\`${guild.id}\`)` : '없음 (DM 채널)')
    .addField('채널 / Channel', guild ? `${channel.name} (\`${channel.id}\`)` : `\`${channel.id}\``)
    .addField('메세지 내용 / Message Content', msgContent)
    .addField('메세지 ID / Message ID', !isSlashCommand ? msgOrInteraction.id : '*XXXXX*')
    .addField('유저 / User', `${executor.tag} (\`${executor.id}\`)`)
    .addField('오류 ID / Error ID', `\`${err.uid}\``)
    .setColor('RED')
    .setTimestamp()

  const ownerList = client.config.owner
  const ownersPing = ownerList.length < 1 || !mentionOwner
    ? '\u200b'
    : ownerList.reduce((acc, cur) => acc + `<@${cur}> `, '')

  webhookClient.send({ content: ownersPing, embeds: [embed] })
}
