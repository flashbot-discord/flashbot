const MsgQuery = require('../structures/MsgQuery')
const getPrefix = require('../modules/getPrefix')
const ClientError = require('../structures/ClientError')

async function onMessage (client, msg) {
  if (msg.author.bot || !msg.content) return

  let calledByMention = false
  let prefix = await checkPrefix(msg)
  if (typeof prefix !== 'string' && !prefix) return
  else if (prefix === true) {
    // TODO change this to default prefix
    prefix = `<@${client.user.id}>`
    calledByMention = true
  }

  // Log
  let logString
  if (msg.guild) logString = `${msg.guild.name} > ${msg.channel.name} > ${msg.author.tag} (${msg.member.nickname}) > ${msg.content}`
  else logString = `DM ${msg.channel.recipient.tag} > ${msg.author.tag} > ${msg.content}`
  client.logger.onCmd(logString)

  const query = new MsgQuery(msg.content, prefix, calledByMention)
  query.calledByMention = calledByMention
  if (calledByMention && query.cmd.length < 1) query.cmd = 'hello' // HelloCommand
  const cmd = client.commands.get(query.cmd)
  if (cmd) {
    if (!client.onlineMode && !client.config.owner.includes(msg.author.id)) return msg.reply(client.locale.t('error.maintenance', 'ko_KR'))
    else client.commands.run(cmd, client, msg, query)
  }
}

async function checkPrefix (msg) {
  const client = msg.client
  if (msg.content.trim().startsWith(`<@${client.user.id}>`)) return true

  let prefix
  try {
    prefix = await getPrefix(client, msg.guild ? msg.guild.id : null)
  } catch (err) {
    const e = new ClientError(err)
    e.report()
  }

  if (!msg.guild && prefix.length < 1) return prefix
  else if (msg.content.startsWith(prefix)) return prefix
  else return false
}

module.exports = onMessage
