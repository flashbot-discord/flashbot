const path = require('path')
const fs = require('fs')

class DatabaseHandler {
  constructor (client, type, connection) {
    const logPos = this.logPos = 'DatabaseHandler'
    this._client = client
    this.type = type
    this.ready = false

    client.logger.log(logPos, 'Database Handler Initializing...')
    client.logger.log(logPos, 'Database Type: ' + type)
    switch (type) {
      case 'mysql': {
        client.logger.debug(logPos, 'Preparing knex Query Builder...')
        const knex = require('knex')({
          client: type,
          connection,
          asyncStackTraces: true
        })

        this.knex = knex
        this.ready = true
        break
      }

      case 'json': {
        // JSON db uses two files:
        // guild.json, user.json
        try {
          if (!connection) connection = {}
          const folder = connection.folder ? path.join(path.resolve(), connection.folder) : path.join(path.resolve(), 'db', 'json')
          this._client.logger.debug(logPos, '[JSON] Root stroage folder: ' + folder)
          const guildFile = 'guild.json'
          const userFile = 'user.json'

          client.logger.debug(logPos, '[JSON] Loading database files...')
          const guild = require(path.join(folder, guildFile))
          const user = require(path.join(folder, userFile))

          this.obj = {}
          this.obj.guild = guild
          this.obj.user = user

          this.path = { folder, guildFile, userFile }
          client.logger.debug(logPos, '[JSON] 2 database files loaded')

          // Autosave (defaults to 1 minute)
          setInterval(() => {
            client.logger.log(logPos, '[JSON] Auto-saving...')
            this.save()
          }, connection.autosave || 60000)
        } catch (err) {
          client.logger.error(logPos, '[JSON] Error when setting up json storage: ' + err.stack)
        }
        break
      }

      default:
        return client.logger.error(logPos, 'Invalid database type: ' + type)
    }

    if (this.ready) client.logger.log(logPos, 'Database Handler initialized')
    else client.logger.warn(logPos, "Database Handler not initialized; Some bot features won't be able to work properly")
  }

  async test () {
    const logPos = this.logPos + '.test'

    this._client.logger.debug(logPos, 'Testing database status')
    switch (this.type) {
      case 'mysql':
        try {
          await this.knex.raw('select 1+1 as test')
          this.ready = true
          this._client.logger.log(logPos + ':MySQL', 'Test Passed')
          return true
        } catch (err) {
          this.ready = false
          this._client.logger.error(logPos + ':MySQL', 'Failed to connect the database: ' + err.stack)
          this._client.logger.warn(logPos + ':MySQL', 'Test Failed; Database feature disabled.')
          return false
        }
      case 'json':
        // TODO
        return true
    }
  }

  async isRegisteredUser (id) {
    switch (this.type) {
      case 'mysql':
        if (await this.knex('user').select('id').where('id', id).length < 1) return false
        else return true

      case 'json':
        if (typeof this.obj.user[id] === 'object') return true
        else return false
    }
  }

  async isRegisteredGuild (id) {
    switch (this.type) {
      case 'mysql':
        if (await this.knex('guild').select('id').where('id', id).length < 1) return false
        else return true

      case 'json':
        if (typeof this.obj.guild[id] === 'object') return true
        else return false
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
