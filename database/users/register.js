const getType = require('../getType')

module.exports = async (handler, userData) => {
  if (userData.id == null) throw new Error('No id value in user property')

  const dbtype = getType(handler.type)
  if (dbtype === 'knex') {
    await handler.knex('users').insert(userData)
  } else if (dbtype === 'json') {
    handler.obj.user[userData.id] = userData
  }
}
