const path = require('path')
const fs = require('fs')

class DatabaseHandler {
  constructor(client, type, connection) {
    this._client = client
    this.type = type

    client.logger.log('DatabaseHandler', 'Database Handler Initializing...')
    client.logger.log('DatabaseHandler', 'Database Type: ' + type)
    switch(type) {
      case 'mysql': {
        client.logger.debug('DatabaseHandler', 'Preparing knex Query Builder...')
        const knex = require('knex')({
          client: type,
          connection
        })

        this.knex = knex
        this.test().catch((err) => {
          client.logger.error('DatabaseHandler', 'Failed to connect the database: ' + err.stack)
        })
        break
      }

      case 'json': {
        // JSON db uses two files:
        // guild.json, user.json
        const folder = connection.folder || path.join(path.resolve(), 'db', 'json')
        const guildFile = connection.guild || 'guild.json'
        const userFile = connection.user || 'user.json'

        client.logger.debug('DatabaseHandler', '[JSON] Loading database files...')
        const guild = require(path.join(folder, guildFile))
        const user = require(path.join(folder, userFile))

        this.obj.guild = guild
        this.obj.user = user

        this.path = { folder, guildFile, userFile }
        client.logger.debug('DatabaseHandler', '[JSON] 2 database files loaded')
        break
      }

      default:
        return client.logger.error('DatabaseHandler', 'Invalid database type: ' + type)
    }

    client.logger.log('DatabaseHandler', 'Database Ready')
  }

  async test() {
    this._client.logger.debug('DatabaseHandler.test', 'Testing database status')
    switch(this.type) {
      case 'mysql':
        try {
          await this.knex.raw('select 1+1 as test')
          return true
        } catch(err) {
          throw err
        }
      case 'json':
        // TODO
        return true
    }
  }

  save() {
    if(this.type !== 'json') return this._client.logger.warn('DatabaseHandler.save', 'No need to save; This only works with JSON database')

    this._save(this.obj.guild, this.path.guildFile)
    this._save(this.obj.user, this.path.userFile)
  }

  _save(obj, filename) {
    fs.writeFileSync(path.join(this.path.folder, filename), JSON.stringify(obj, null, 2))
  }
}

module.exports = DatabaseHandler
