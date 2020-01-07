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
    
    //TODO database check / create all table if no tables found / print 'corrupted' when some of the tables are found (not all)
  }
  
  async get(table, id, column) {
    if(id) {
      return await this.db.from(table).column(column).where('id', id)
    } else {
      return await this.db.from(table).column(column)
    }
  }

  async set(table, id, data) {
    let check = await this.db.from(table).select('id').where('id', id)
    if(check.length > 0 && check[0].id === id) {
      return await this.db.from(table).where('id', id).update(data)
    } else {
      return await this.db.from(table).insert({...{id: id}, ...data})
    }
  }
}

module.exports = MySQLProvider
