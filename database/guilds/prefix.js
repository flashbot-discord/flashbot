const getType = require('../getType')

exports.get = async (handler, guildid) => {
  const dbtype = getType(handler.type)
  if (dbtype === 'knex') {
    const data = await handler.knex('guilds')
      .select('prefix')
      .where('id', guildid)
    return data[0].prefix
  } else if (dbtype === 'json') {
    return handler.obj.guild[guildid].prefix
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
