module.exports = (dbtype) => {
  if (['mysql', 'pg'].includes(dbtype)) return 'knex'
  else if (dbtype === 'json') return 'json'
  else return null // Unsupported
}
