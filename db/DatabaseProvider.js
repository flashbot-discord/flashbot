const { SettingProvider } = require('discord.js-commando')

class DatabaseProvider extends SettingProvider {
  /*
   * Removes all settings of a spicific guild/user in a table or rootNode
   * @param {Object} tableOrRootNode `table` if the database is relational (like mysql, postgres), or `rootNode` if NoSQL (like json, RethinkDB)
   * @param {string} id the id of guild or user.
   * @returns {Promise<void>}
   * @abstract
   */
  async clear (tableOrRootNode, id) {
    throw new Error('clear() is not implemented')
  }

  /*
  async destroy() {
    throw new Error('destroy() is not implemented')
  }
  */

  /*
   * Get the value from the database.
   * @param {Object} tableOrRootNode `table` if the database is relational (like mysql, postgres), or `rootNode` if NoSQL (like json, RethinkDB)
   * @param {string|number} the id of user or guild
   * @param {Array<string>} columnsOrProperties `columns` if relational database (like mysql, postgres), or `properties` if NoSQL (like json, RethinkDB)
   * @returns {Promise<Object>} the value with the key which is the element of `columnsOrProperties`
   * @abstract
   */
  async get (tableOrRootNode, id, columnsOrProperties) {
    throw new Error('get() is not implemented')
  }

  /*
   * Removes a value from the database.
   * @param {Object} tableOrRootNode `table` if the database is relational (like mysql, postgres), or `rootNode` if NoSQL (like json, RethinkDB)
   * @param {string|number} the id of user or guild
   * @param {Array<string>} columnsOrProperties `columns` if relational database (like mysql, postgres), or `properties` if NoSQL (like json, RethinkDB)
   * @returns {Promise<Object>} the Object with the previous value, mapped with their columns or properties' name.
   */
  async remove (tableOrRootNode, id, columnsOrProperties) {
    throw new Error('remove() is not implemented')
  }

  /*
   * Set the value to the database.
   * @param {Object} tableOrRootNode `table` if relational database (like mysql, postgres), or `rootNode` if NoSQL (like json, RethinkDB)
   * @param {string|number} the id of user or guild
   * @param {Object} data the data to set (except `id`)
   * @returns {Promise<*>} new value
   */
  async set (tableOrRootNode, id, data) {
    throw new Error('set() is not implemented')
  }
}

module.exports = DatabaseProvider
