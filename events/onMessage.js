const MsgQuery = require('../classes/MsgQuery')

async function onMessage (client, msg) {
  if (msg.author.bot || !msg.content) return
  if (!msg.content.startsWith(client.config.prefix) || !msg.mentions.users.first() === client.user) return

  const query = new MsgQuery(client, msg)
  const cmd = client.commands.get(query.cmd)
  if (cmd) client.commands.run(cmd, client, msg, query)
}

module.exports = onMessage
