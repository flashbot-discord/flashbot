const { SettingProvider } = require('discord.js-commando')

class DatabaseProvider extends SettingProvider {
  /*
   * Get the value from the database.
   * @param {Object} tableOrRootNode `table` if the database is relational (like mysql, postgres), or `rootNode` if NoSQL (like json, RethinkDB)
   * @param {string|number} the id of user or guild
   * @param {Array<string>} columnsOrProperties `columns` if relational database (like mysql, postgres), or `properties` if NoSQL (like json, RethinkDB)
   * @returns {Object} the value with the key which is the element of `columnsOrProperties`
   * @abstract
   */
  async get(tableOrRootNode, id, columnsOrProperties) {
    throw new Error('get() is not implemented')
  }

  /*
   * Set the value to the database.
   * @param {Object} tableOrRootNode `table` if relational database (like mysql, postgres), or `rootNode` if NoSQL (like json, RethinkDB)
   * @param {string|number} the id of user or guild
   * @param {Object} data the data to set (except `id`)
   */
  async set(tableOrRootNode, id, data) {
    throw new Error('set() is not implemented')
  }
}

module.exports = DatabaseProvider
