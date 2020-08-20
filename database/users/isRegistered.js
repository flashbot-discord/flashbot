const getType = require('../getType')

module.exports = async (handler, userid) => {
  const dbtype = getType(handler.type)
  if (dbtype === 'knex') {
    const data = await handler.knex('users').select('id').where('id', userid)
    return data.length > 0
  } else if (dbtype === 'json') {
    return typeof handler.obj.user[userid] === 'object'
  }
}
