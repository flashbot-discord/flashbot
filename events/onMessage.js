const MsgQuery = require('../classes/MsgQuery')
const database = require('../database')

async function onMessage (client, msg) {
  if (msg.author.bot || !msg.content) return

  const prefix = await checkPrefix(msg)
  if (!prefix) return

  // Log
  let logString
  if (msg.guild) logString = `${msg.guild.name} > ${msg.channel.name} > ${msg.author.tag} (${msg.member.nickname}) > ${msg.content}`
  else logString = `DM ${msg.channel.recipient.tag} > ${msg.author.tag} > ${msg.content}`
  client.logger.onCmd(logString)

  const query = new MsgQuery(msg.content, prefix)
  const cmd = client.commands.get(query.cmd)
  if (cmd) client.commands.run(cmd, client, msg, query)
}

async function checkPrefix (msg) {
  const client = msg.client
  if (msg.content.trim().startsWith(`<@${client.user.id}>`)) return `<@${client.user.id}>`

  let prefix
  if (msg.guild) {
    const guildPrefix = await database.guilds.prefix.get(client.db, msg.guild.id)
    prefix = guildPrefix == null ? client.config.prefix : guildPrefix
  } else prefix = client.config.prefix

  if (msg.content.startsWith(prefix)) return prefix
  else return false
}

module.exports = onMessage
