const database = require('../database')

module.exports = async (client, guildid) => {
  if (!guildid) return ''

  const guildPrefix = await database.guilds.prefix.get(client.db, guildid)
  return guildPrefix == null ? client.config.prefix : guildPrefix
}
