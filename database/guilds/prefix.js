const getType = require('../getType')

exports.get = async (handler, guildid) => {
  const dbtype = getType(handler.type)
  if (dbtype === 'knex') {
    const data = await handler.knex('guilds')
      .select('prefix')
      .where('id', guildid)
    if (data.length < 1) return null
    return data[0].prefix
  } else if (dbtype === 'json') {
    const guildData = handler.obj.guild[guildid]
    if (typeof guildData !== 'object') return null
    else return guildData.prefix
  }
}

exports.set = async (handler, guildid, prefix) => {
  const dbtype = getType(handler.type)
  if (dbtype === 'knex') {
    await handler.knex('guilds')
      .update({ prefix })
      .where('id', guildid)
  } else if (dbtype === 'json') {
    handler.obj.guild[guildid].prefix = prefix
  }
}
