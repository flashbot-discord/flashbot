const path = require('path')
const fs = require('fs')

class DatabaseHandler {
  constructor (client, type, connection) {
    this._client = client
    this.type = type
    this.ready = false

    client.logger.log('DatabaseHandler', 'Database Handler Initializing...')
    client.logger.log('DatabaseHandler', 'Database Type: ' + type)
    switch (type) {
      case 'mysql': {
        client.logger.debug('DatabaseHandler', 'Preparing knex Query Builder...')
        const knex = require('knex')({
          client: type,
          connection
        })

        this.knex = knex
        break
      }

      case 'json': {
        // JSON db uses two files:
        // guild.json, user.json
        try {
          if (!connection) connection = {}
          const folder = connection.folder ? path.join(path.resolve(), connection.folder) : path.join(path.resolve(), 'db', 'json')
          this._client.logger.debug('DatabaseHandler', '[JSON] Root stroage folder: ' + folder)
          const guildFile = 'guild.json'
          const userFile = 'user.json'

          client.logger.debug('DatabaseHandler', '[JSON] Loading database files...')
          const guild = require(path.join(folder, guildFile))
          const user = require(path.join(folder, userFile))

          this.obj = {}
          this.obj.guild = guild
          this.obj.user = user

          this.path = { folder, guildFile, userFile }
          client.logger.debug('DatabaseHandler', '[JSON] 2 database files loaded')

          // Autosave (defaults to 1 minute)
          setInterval(() => {
            client.logger.log('DatabaseHandler', '[JSON] Auto-saving...')
            this.save()
          }, connection.autosave || 60000)

          this.ready = true
        } catch (err) {
          client.logger.error('DatabaseHandler', '[JSON] Error when setting up json storage: ' + err.stack)
        }
        break
      }

      default:
        return client.logger.error('DatabaseHandler', 'Invalid database type: ' + type)
    }

    if (this.ready) client.logger.log('DatabaseHandler', 'Database Ready')
    else client.logger.warn('DatabaseHandler', "Database not ready; Some bot features won't be able to work properly")
  }

  async test () {
    this._client.logger.debug('DatabaseHandler.test', 'Testing database status')
    switch (this.type) {
      case 'mysql':
        try {
          await this.knex.raw('select 1+1 as test')
          this.ready = true
          return true
        } catch (err) {
          this.ready = false
          this._client.logger.error('DatabaseHandler', 'Failed to connect the database: ' + err.stack)
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
    if (this.type !== 'json') return this._client.logger.warn('DatabaseHandler.save', 'No need to save; This only works with JSON database')

    this._save(this.obj.guild, this.path.guildFile)
    this._save(this.obj.user, this.path.userFile)

    this._client.logger.log('DatabaseHandler.save', '[JSON] All data were saved')
  }

  _save (obj, filename) {
    fs.writeFileSync(path.join(this.path.folder, filename), JSON.stringify(obj, null, 2))
  }
}

module.exports = DatabaseHandler
