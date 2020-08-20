const getType = require('../getType')

module.exports = async (handler, guildData) => {
  if (guildData.id == null) throw new Error('No id value in guild property')

  const dbtype = getType(handler.type)
  if (dbtype === 'knex') {
    await handler.knex('guilds').insert(guildData)
  } else if (dbtype === 'json') {
    handler.obj.guild[guildData.id] = guildData
  }
}
