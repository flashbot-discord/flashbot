const database = require('../database')

module.exports = async (client, guildid) => {
  if (!client.db.ready) return client.config.prefix
  else if (!guildid) return ''

  const guildPrefix = await database.guilds.prefix.get(client.db, guildid)
  return guildPrefix == null ? client.config.prefix : guildPrefix
}
