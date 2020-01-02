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
}

module.exports = MySQLProvider
