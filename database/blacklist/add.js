const getType = require('../getType')

module.exports = (handler, opts) => {
  const { id, endDate, reason } = opts

  // Validation
  if (typeof id !== 'string') throw new TypeError('id must be string')
  else if (!(endDate instanceof Date)) throw new TypeError('endDate must be Date object')
  else if (typeof reason !== 'string') throw new TypeError('reason must be string')

  const dbtype = getType(handler.type)
  switch (handler.type) {
    case 'knex':
      break

    case 'json': {
      // Reject when entry already exists
      if (handler.obj.blacklist[id]) return false
      
      handler.obj.blacklist[id] = {
        endDate: endDate.getTime(),
        reason
      }
      
      return true
    } 
  }
}
