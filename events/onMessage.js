const MsgQuery = require('../classes/MsgQuery')
const database = require('../database')
const getPrefix = require('../modules/getPrefix')

async function onMessage (client, msg) {
  if (msg.author.bot || !msg.content) return

  let calledByMention = false
  let prefix = await checkPrefix(msg)
  if (typeof prefix !== 'string' && !prefix) return
  else if (prefix === true) {
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
  if (cmd) client.commands.run(cmd, client, msg, query)
}

async function checkPrefix (msg) {
  const client = msg.client
  if (msg.content.trim().startsWith(`<@${client.user.id}>`)) return true

  const prefix = await getPrefix(client, msg.guild ? msg.guild.id : null)
  if (!msg.guild && prefix.length < 1) return prefix
  else if (msg.content.startsWith(prefix)) return prefix
  else return false
}

module.exports = onMessage
