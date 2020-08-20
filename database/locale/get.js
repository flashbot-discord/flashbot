const getType = require('../getType')
const isRegisteredUser = require('../users/isRegistered')
const isRegisteredGuild = require('../guilds/isRegistered')

module.exports = async (handler, id, isGuild) => {
  const dbtype = getType(handler.type)
  if (dbtype === 'knex') {
    const data = await handler.knex(isGuild ? 'guilds' : 'users')
      .select('locale')
      .where('id', id)
    return data.length < 1 ? null : data[0].locale
  } else if (dbtype === 'json') {
    const isRegistered = isGuild ? isRegisteredGuild : isRegisteredUser
    return isRegistered(handler, id) ? handler.obj[isGuild ? 'guild' : 'user'][id].locale : null
  }
}
