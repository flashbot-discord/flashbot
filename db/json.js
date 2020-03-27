const { SettingProvider, CommandoRegistry } = require('discord.js-commando')
const fs = require('fs')

const settings = require('../config.json')

let obj = {}

module.exports = class JSONProvider extends SettingProvider {
  /**
   * Construct **JSONProvider** with `.json` file.
   * @param {string} file
   * @param {boolean} dotNotation
   */
  constructor () {
    super()
    this.files = settings.db.connection

    this.propertyTemplate = {
      configurable: true,
      enumerable: true,
      writable: true
    }
  }

  async clear (guild) {
    guild = this.constructor.getGuildID()
    if (!obj.hasOwnProperty(guild)) return

    for (const key of Object.keys(obj[guild])) {
      delete obj[guild][key]
    }
  }

  /**
   * Destroys the provider, removing any event listeners.
   * @returns {Promise<void>}
   */
  async destroy () {
    // delete obj;
    obj = null
  }

  /**
   * Obtains a setting for a guild
   * @todo dot notation support
   *
   * @param {Guild|string} guild Guild the setting is associated with (or 'global')
   * @param {string} key Name of the setting
   * @param {?string} defVal Value to default to if the setting isn't set on the guild
   */
  get (guild, key, defVal) {
    guild = this.constructor.getGuildID(guild)
    if (!this.guildAvailable(guild)) return undefined

    return obj[guild][key] === undefined ? defVal || undefined : obj[guild][key]
  }

  async init (client) {
    console.log('[DB/JSON]: init...')

    await this.loadFile(files.guild, 'guild')
    await this.loadFile(files.user, 'user')
  }

  async remove (guild, key) {
    if (!obj.hasOwnProperty(key)) throw new Error('Key not exist!')

    const val = obj[guild][key]
    delete obj[guild][key]

    return val
  }

  /**
     * Sets a setting for a guild
     * @todo dot notation support
     *
     * @param {Guild|string} guild Guild to associate the setting with (or 'global')
     * @param {string} key Name of the setting
     * @param {*} val Value of the setting
     *
     * @returns {Promise<*>} New value of the setting
     */
  set (guild, key, val) {
    return new Promise((resolve, reject) => {
      try {
        guild = this.constructor.getGuildID(guild)

        if (!this.guildAvailable(guild)) this.addGuild(guild)

        if (!obj[guild].hasOwnProperty(key)) {
          Object.defineProperty(obj[guild], key, this.propertyTemplate)
        }
        obj[guild][key] = val

        this.write(obj)

        resolve(val)
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
     * Writes the database object to JSON file.
     * @private
     */
  write (obj) {
    fs.writeFileSync(this.file, JSON.stringify(obj))
  }

  guildAvailable (guild) {
    if (!obj.hasOwnProperty(guild)) return false
    else return true
  }

  addGuild (guild_id) {
    Object.defineProperty(obj, guild_id, this.propertyTemplate)
    obj[guild_id] = {}
    this.write(obj)
  }

  loadFile (file, property) {
    return new Promise((resolve, reject) => {
      try {
        if (!file.endsWith('.json')) {
          console.error(`[DB/JSON] ${file}: Not a vaild file!`)
          reject()
        }
        if (!fs.existsSync(file)) {
          console.error(`[DB/JSON] ${file}: File not exist!`)

          fs.writeFileSync(file, '{}')
          console.log(`[DB/JSON] Created file: ${file}`)
        }

        obj = require('../' + file)
        console.log(`[DB/JSON] ${file}: read success`)

        /*

                if (!'guilds' in obj) {
                    Object.defineProperty(obj, 'guilds', propertyTemplate);
                    obj.guilds = {};
                }

                delete obj.commands;
                Object.defineProperty(obj, 'commands', propertyTemplate);
                obj.commands = {};

                client.registry.commands.forEach(command => {
                    Object.defineProperty(obj.commands, command.name, propertyTemplate);
                    obj.commands[command.name] = {};
                    Object.defineProperty(obj.commands[command.name], 'enable', propertyTemplate);
                    obj.commands[command.name].enable = true;
                });

                const keys = Object.keys(obj.commands);
                client.registry.commands.forEach(command => {
                    if(!(keys.includes(command.name) && typeof obj.commands[keys[keys.findIndex(v => v === command.name)]] === 'Object')) { // not have global command config in database
                        Object.defineProperty(obj.commands, command.name, propertyTemplate);
                        obj.commands[command.name] = {};
                        Object.defineProperty(obj.commands[command.name], 'enable', propertyTemplate);
                        obj.commands[command.name].enable = true;
                    }
                });

                this.write(obj);

                */

        this.db[property] = obj
        resolve()
      } catch (error) {
        reject(error)
      }
	    })
  }
}
