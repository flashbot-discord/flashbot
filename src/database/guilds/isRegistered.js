const getType = require('../getType')

module.exports = async (handler, guildid) => {
  const dbtype = getType(handler.type)
  if (dbtype === 'knex') {
    const data = await handler.knex('guilds').select('id').where('id', guildid)
    return data.length > 0
  } else if (dbtype === 'json') return typeof handler.obj.guild[guildid] === 'object'
}
