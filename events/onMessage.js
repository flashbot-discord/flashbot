const MsgQuery = require('../classes/MsgQuery')

async function onMessage (client, msg) {
  if (msg.author.bot || !msg.content) return
  if (!msg.content.startsWith(client.config.prefix) || !msg.mentions.users.first() === client.user) return

  // Log
  let logString
  if (msg.guild) logString = `${msg.guild.name} > ${msg.channel.name} > ${msg.author.tag} (${msg.member.nickname}) > ${msg.content}`
  else logString = `DM ${msg.channel.name} > ${msg.author.tag} > ${msg.content}`
  client.logger.onCmd(logString)

  const query = new MsgQuery(client, msg)
  const cmd = client.commands.get(query.cmd)
  if (cmd) client.commands.run(cmd, client, msg, query)
}

module.exports = onMessage
