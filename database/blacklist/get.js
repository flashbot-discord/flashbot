const getType = require('../getType')

module.exports = (handler, id) => {
  const dbtype = getType(handler.type)
  switch (handler.type) {
    case 'knex':
      break

    case 'json': {
      return handler.obj.blacklist[id]
    } 
  }
}
