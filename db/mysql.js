const { SettingProvider, CommandoRegistry } = require('discord.js-commando')
const DatabaseProvider = require('./DatabaseProvider')

class MySQLProvider extends SettingProvider {
  constructor (conn) {
    super()
    this.conn = conn
  }

  async init () {
    console.log('[DB/MySQL] Init...')

    // if()

    this.db = require('knex')({
      client: 'mysql',
      connection: this.conn,
      log: {
        warn (msg) {
          console.warn('[DB/MySQL/Warn]' + msg)
        },
        error (msg) {
          console.error('[DB/MySQL/Error]' + msg)
        },
        debug (msg) {
	  console.log('[DB/MySQL/Debug]' + msg)
        }
      }
    })

    // TODO database check / create all table if no tables found / print 'corrupted' when some of the tables are found (not all)
  }

  /**
   * Get the value from the database.
   * @param {Object} table the table of the database
   * @param {string} id the id of user or guild
   * @param {Array<string>} columns the columns of the table to get
   * @returns {Promise<Object>} the value with the key which is the element of `columns`
   */
  async get (table, id, columns) {
    if (id) {
      return await this.db.from(table).column(columns).where('id', id)
    } else {
      return await this.db.from(table).column(columns)
    }
  }

  /**
   * Set the value to the database.
   * @param {Object} table the table of the database
   * @param {string} id the id of user or guild
   * @param {Object} data the data to set (except `id`)
   * @returns {Promise<*>} new value
   */
  async set (table, id, data) {
    const check = await this.db.from(table).select('id').where('id', id)
    if (check.length > 0 && check[0].id === id) {
      return await this.db.from(table).where('id', id).update(data)
    } else {
      return await this.db.from(table).insert({ ...{ id: id }, ...data })
    }

    return data
  }

  /**
   * Removes one row from the database.
   * @param {Object} table the table of the database
   * @param {string} id the id of user or guild
   * @returns {Promise<Object>} the Object with the previous value, mapped with their columns' name.
   */
  async remove (table, id) {
    return await this.db.from(table).where('id', id).del()
  }

  async destroy () {
    return await this.db.destroy()
  }
}

module.exports = MySQLProvider
