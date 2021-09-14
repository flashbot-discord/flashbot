const { WebhookClient, MessageEmbed } = require('discord.js')

const loggerGen = require('./logger')

module.exports = async (err, msg, t, logPos) => {
  const { client } = msg

  const logger = loggerGen(logPos)
  logger.error(err.stack)
  msg.reply(t('ClientError.error', err.message, err.uid)) // TODO: without translation

  // NOTE: Webhook report
  const { id, token, enable, mentionOwner } = client.config.errorWebhook
  if (!enable) return

  const webhookClient = new WebhookClient(id, token)

  const errStack = err.stack.length > 4000 ? (err.stack.slice(0, 4000) + '...') : err.stack
  const msgContent = msg.content.length > 1500 ? (msg.content.slice(0, 1500) + '...') : msg.content
  const embed = new MessageEmbed()
    .setTitle('봇 오류 / Bot Error')
    .setDescription(errStack)
    .addField('서버 / Server', msg.guild ? `${msg.guild.name} (\`${msg.guild.id}\`)` : '없음 (DM 채널)')
    .addField('채널 / Channel', msg.guild ? `${msg.channel.name} (\`${msg.channel.id}\`)` : `\`${msg.channel.id}\``)
    .addField('메세지 내용 / Message Content', msgContent)
    .addField('메세지 ID / Message ID', msg.id)
    .addField('유저 / User', `${msg.author.tag} (\`${msg.author.id}\`)`)
    .addField('오류 ID / Error ID', `\`${err.uid}\``)
    .setColor('RED')
    .setTimestamp()

  const ownerList = client.config.owner
  const ownersPing = ownerList.length < 1 || !mentionOwner
    ? '\u200b'
    : ownerList.reduce((acc, cur) => acc + `<@${cur}> `, '')

  webhookClient.send({ content: ownersPing, embeds: [embed] })
}
