const { SettingProvider, CommandoRegistry } = require('discord.js-commando');
const DatabaseProvider = require('./DatabaseProvider')

class MySQLProvider extends DatabaseProvider {
  constructor(conn) {
    super()
    this.conn = conn
  }

  init() {
    console.log('[DB/MySQL] Init...')

    //if()
    
    this.db = require('knex')({
      client: 'mysql',
      connection: this.conn,
      log: {
        warn(msg) {
          console.warn('[DB/MySQL/Warn]' + msg)
	},
	error(msg) {
          console.error('[DB/MySQL/Error]' + msg)
	},
	debug(msg) {
	  console.log('[DB/MySQL/Debug]' + msg)
	}
      }
    })

  }
  
  async get(table, id, column) {
    if(id) {
      return await this.db.from(table).column(column).where('id', id)
    } else {
      return await this.db.from(table).column(column)
    }
  }

  async set(table, id, data) {
    if(this.db.from(table).select('id').where('id', id).has({id: id})) {
      return await this.db.from(table).where('id', id).update(data)
    } else {
      return await this.db.from(table).insert({...{id: id}, ...data})
    }
  }
}

module.exports = MySQLProvider
