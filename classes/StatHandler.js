const { Collection } = require('discord.js')

/**
 * Statistics Handler
 */
class StatHandler {

  /**
   * Constructor of StatHandler
   * @params {require('./BotClient')} client Bot Client
   */
  constructor(client) {
    this._client = client

    /**
     * Statistics ordered by commands
     */
    this.stats = new Collection()
  }

  /**
   * Add command usage to statistics.
   * @params {string} cmd the command name
   * @params {string} guildId the id of guild where the command executed
   */
  stat(cmd, guildId) {
    if(this.stats.has(cmd)) {
      const data = this.stats.get(cmd)

      if(data.guilds.has(guildId)) {
        data.guilds.set(guildId, data.guilds.get(guildId) + 1)
      } else data.guilds.set(guildId, 1)

      this.stats.set(cmd, data)
    } else this.stats.set(cmd, {
      guilds: new Collection([[guildId, 1]])
    })
  }

  getTotal() {
    return this.stats.reduce((total, current) => total + current.guilds.reduce((guildTotal, guildCurrent) => guildTotal + guildCurrent, 0), 0)
  }
}

module.exports = StatHandler
