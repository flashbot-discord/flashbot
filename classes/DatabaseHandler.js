const path = require('path')
const fs = require('fs')

class DatabaseHandler {
  constructor (client, type, connection) {
    const logPos = this.logPos = 'DatabaseHandler'
    this._client = client
    this.type = type

    client.logger.log(logPos, 'Database Handler Initializing...')
    client.logger.log(logPos, 'Database Type: ' + type)
    switch (type) {
      case 'mysql':
      case 'pg': {
        client.logger.debug(logPos, 'Preparing knex Query Builder...')
        const knex = require('knex')({
          client: type,
          connection,
          asyncStackTraces: client.debugMode,
          debug: client.debugMode
        })

        this.knex = knex
        break
      }

      case 'json': {
        // JSON db uses two files:
        // guild.json, user.json
        try {
          if (!connection) connection = {}
          const folder = path.join(path.resolve(), 'data', 'jsondb')
          this._client.logger.debug(logPos, '[JSON] Root stroage folder: ' + folder)
          const guildFile = 'guild.json'
          const userFile = 'user.json'
          const blacklistFile = 'blacklist.json'

          client.logger.debug(logPos, '[JSON] Loading database files...')
          const guild = require(path.join(folder, guildFile))
          const user = require(path.join(folder, userFile))
          const blacklist = require(path.join(folder, blacklistFile))
          this.obj = { guild, user, blacklist }
          this.path = { folder, guildFile, userFile }

          client.logger.debug(logPos, '[JSON] 3 database files loaded')
        } catch (err) {
          client.logger.error(logPos, '[JSON] Error when setting up json storage: ' + err.stack)
        }
        break
      }

      default:
        return client.logger.error(logPos, 'Invalid database type: ' + type)
    }

    setInterval(() => this.test(), 60000) // DB Test period

    client.logger.log(logPos, 'Database Handler initialized')
  }

  // ready value
  get ready () {
    return this._ready
  }

  set ready (v) {
    if (v !== this._ready) {
      if (v) {
        this._client.logger.log(this.logPos + ':' + this.type, 'Test Passed')
        this._ready = true
      } else {
        this._client.logger.warn(this.logPos + ':' + this.type, 'Test Failed; Database feature disabled.')
        this._ready = false
      }
    }
  }

  async test () {
    const logPos = this.logPos + '.test'

    this._client.logger.debug(logPos, 'Testing database status')
    switch (this.type) {
      case 'mysql':
      case 'pg':
        try {
          await this.knex.raw('select 1+1 as test')
          this.ready = true
          return true
        } catch (err) {
          this._client.logger.error(logPos + ':' + this.type, 'Failed to connect to the database: ' + err.stack)
          this.ready = false
          return false
        }
      case 'json':
        // Autosave (defaults to 1 minute)
        this._client.logger.log(logPos, '[JSON] Auto-saving...')
        try {
          this.save()
          this.ready = true
          return true
        } catch (e) {
          this.ready = false
          return false
        }
    }
  }

  save () {
    const logPos = this.logPos + '.save'

    if (this.type !== 'json') return this._client.logger.warn(logPos, 'No need to save; This only works with JSON database')

    this._save(this.obj.guild, this.path.guildFile)
    this._save(this.obj.user, this.path.userFile)

    this._client.logger.log(logPos, '[JSON] All data were saved')
  }

  _save (obj, filename) {
    fs.writeFileSync(path.join(this.path.folder, filename), JSON.stringify(obj, null, 2))
  }
}

module.exports = DatabaseHandler
