const getType = require('../getType')

module.exports = async (handler, guildid) => {
  const dbtype = getType(handler.type)
  if (dbtype === 'knex') {
    const data = await handler.knex('guilds')
      .select('activated')
      .where('id', guildid)
    if (data.length < 1 || !data[0].activated) return false
    else return true
  } else if (dbtype === 'json') {
    if (typeof handler.obj.guild[guildid] === 'object' && handler.obj.guild[guildid].activated) return true
    else return false
  }
}
