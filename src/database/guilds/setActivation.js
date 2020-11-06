const getType = require('../getType')

module.exports = async (handler, guildid, activate) => {
  const dbtype = getType(handler.type)
  if (dbtype === 'knex') {
    await handler.knex('guilds')
      .update({ activated: activate })
      .where('id', guildid)
  } else if (dbtype === 'json') {
    handler.obj.guild[guildid].activated = activate
  }
}
