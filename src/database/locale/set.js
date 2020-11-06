const getType = require('../getType')

module.exports = async (handler, id, isGuild, locale) => {
  const dbtype = getType(handler.type)
  if (dbtype === 'knex') {
    await handler.knex(isGuild ? 'guilds' : 'users')
      .update({ locale })
      .where('id', id)
  } else if (dbtype === 'json') {
    handler.obj[isGuild ? 'guild' : 'user'][id].locale = locale
  }
}
